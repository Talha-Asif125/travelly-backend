const Service = require("../models/Service");
const User = require("../models/userModel");

// Get all services for a provider
const getProviderServices = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { type } = req.query;
    
    // Build query filter
    const filter = { providerId };
    if (type) {
      filter.type = type;
    }
    
    const services = await Service.find(filter)
      .populate('providerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });

  } catch (error) {
    console.error("Error fetching provider services:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Create a new service
const createService = async (req, res) => {
  try {
    const providerId = req.user.id;
    
    // Verify user is a provider
    const user = await User.findById(providerId);
    if (!user || user.type !== 'provider') {
      return res.status(403).json({
        success: false,
        message: "Only approved service providers can create services"
      });
    }

    // Get the service type from request body
    const requestedServiceType = req.body.type;
    
    if (!requestedServiceType) {
      return res.status(400).json({
        success: false,
        message: "Service type is required"
      });
    }

    // Validate required fields
    const { name, description, price } = req.body;
    
    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and price are required fields",
        missingFields: {
          name: !name,
          description: !description,
          price: !price
        }
      });
    }

    // Validate numeric fields
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number"
      });
    }

    // Check if user is approved for this specific service type
    // Handle backward compatibility - check both providerTypes array and legacy providerType
    let isApprovedForType = false;
    
    if (user.providerTypes && user.providerTypes.includes(requestedServiceType)) {
      isApprovedForType = true;
    } else if (user.providerType === requestedServiceType) {
      // Legacy compatibility - migrate to new format
      if (!user.providerTypes || user.providerTypes.length === 0) {
        user.providerTypes = [user.providerType];
        await user.save();
        console.log(`Migrated legacy provider type for user ${providerId}: ${user.providerType}`);
      }
      isApprovedForType = true;
    }
    
    if (!isApprovedForType) {
      const userApprovedTypes = user.providerTypes || (user.providerType ? [user.providerType] : []);
      return res.status(403).json({
        success: false,
        message: `You are not approved to provide ${requestedServiceType} services. Please apply for ${requestedServiceType} provider status first.`,
        approvedTypes: userApprovedTypes
      });
    }

    // Create service with provider ID and specified type
    const serviceData = {
      ...req.body,
      providerId,
      type: requestedServiceType,
      price: parseFloat(price) // Ensure price is a number
    };

    // Log the service data for debugging
    console.log('Creating service with data:', {
      ...serviceData,
      images: serviceData.images ? `${serviceData.images.length} images` : 'no images'
    });

    const newService = new Service(serviceData);
    const savedService = await newService.save();

    // Populate provider info for response
    await savedService.populate('providerId', 'name email');

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: savedService
    });

  } catch (error) {
    console.error("Error creating service:", error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update a service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    // Find service and verify ownership
    const service = await Service.findOne({ _id: id, providerId });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or you don't have permission to edit it"
      });
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('providerId', 'name email');

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService
    });

  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete a service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    // Find service and verify ownership
    const service = await Service.findOne({ _id: id, providerId });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or you don't have permission to delete it"
      });
    }

    await Service.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Service deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    const service = await Service.findOne({ _id: id, providerId })
      .populate('providerId', 'name email');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or you don't have permission to view it"
      });
    }

    res.status(200).json({
      success: true,
      data: service
    });

  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get user's approved provider types and application status
const getUserProviderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's current data
    const user = await User.findById(userId).select('type providerTypes providerType');
    console.log('Current user data:', {
      userId,
      type: user.type,
      providerTypes: user.providerTypes,
      providerType: user.providerType
    });
    
    // Get all provider requests for this user
    const ServiceProviderRequest = require("../models/ServiceProviderRequest");
    const requests = await ServiceProviderRequest.find({ userId })
      .select('providerType status submittedAt reviewedAt rejectionReason')
      .sort({ submittedAt: -1 });

    console.log('Provider requests:', requests);

    // Find all approved requests
    const approvedRequests = requests.filter(request => request.status === 'approved');
    console.log('Approved requests:', approvedRequests);

    // Get approved types from requests
    const approvedTypesFromRequests = approvedRequests.map(request => request.providerType);
    console.log('Approved types from requests:', approvedTypesFromRequests);

    // Handle backward compatibility and data repair
    let approvedTypes = user.providerTypes || [];
    let userNeedsUpdate = false;
    
    // If user has legacy providerType but no providerTypes array, migrate it
    if (user.providerType && (!user.providerTypes || user.providerTypes.length === 0)) {
      approvedTypes = [user.providerType];
      user.providerTypes = approvedTypes;
      userNeedsUpdate = true;
      console.log(`Migrating legacy provider type ${user.providerType} for user ${userId}`);
    }

    // Check if there are approved requests that aren't in the user's providerTypes
    const missingTypes = approvedTypesFromRequests.filter(type => !approvedTypes.includes(type));
    if (missingTypes.length > 0) {
      console.log('Found missing provider types in user record:', missingTypes);
      approvedTypes = [...new Set([...approvedTypes, ...missingTypes])];
      user.providerTypes = approvedTypes;
      userNeedsUpdate = true;
    }

    // If user isn't marked as provider but has approved requests, update user type
    if (user.type !== 'provider' && approvedTypesFromRequests.length > 0) {
      console.log('User has approved provider requests but type is not "provider", updating...');
      user.type = 'provider';
      userNeedsUpdate = true;
    }
    
    // Save user if updated
    if (userNeedsUpdate) {
      await user.save();
      console.log(`Updated user ${userId} with provider types:`, approvedTypes);
      console.log('Updated user type to:', user.type);
    }
    
    // Organize requests by provider type for status tracking
    const statusByType = {};
    requests.forEach(request => {
      statusByType[request.providerType] = {
        status: request.status,
        submittedAt: request.submittedAt,
        reviewedAt: request.reviewedAt,
        rejectionReason: request.rejectionReason
      };
    });

    const responseData = {
      userType: user.type,
      approvedTypes: approvedTypes,
      legacyProviderType: user.providerType, // For backward compatibility
      applicationStatus: statusByType,
      canApplyFor: ['hotel', 'vehicle', 'tour', 'restaurant', 'event'].filter(
        type => !statusByType[type] || statusByType[type].status === 'rejected'
      )
    };

    console.log('Final response data:', responseData);

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Error fetching user provider status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Data repair function - fixes inconsistencies between ServiceProviderRequest and User records
const repairProviderData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`Starting data repair for user ${userId}`);
    
    // Get user's current data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log('Current user data before repair:', {
      userId,
      type: user.type,
      providerTypes: user.providerTypes,
      providerType: user.providerType
    });
    
    // Get all approved provider requests for this user
    const ServiceProviderRequest = require("../models/ServiceProviderRequest");
    const approvedRequests = await ServiceProviderRequest.find({ 
      userId, 
      status: 'approved' 
    }).select('providerType status submittedAt reviewedAt');

    console.log('Found approved requests:', approvedRequests);

    if (approvedRequests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No approved provider requests found",
        data: {
          userType: user.type,
          approvedTypes: user.providerTypes || [],
          repairsMade: []
        }
      });
    }

    // Get approved types from requests
    const approvedTypesFromRequests = approvedRequests.map(request => request.providerType);
    console.log('Approved types from requests:', approvedTypesFromRequests);

    let repairsMade = [];
    let userChanged = false;

    // Ensure user type is 'provider' if they have approved requests
    if (user.type !== 'provider') {
      user.type = 'provider';
      userChanged = true;
      repairsMade.push(`Changed user type from '${user.type}' to 'provider'`);
      console.log('Fixed user type to provider');
    }

    // Ensure providerTypes array is set correctly
    let currentApprovedTypes = user.providerTypes || [];
    
    // Add missing types
    const missingTypes = approvedTypesFromRequests.filter(type => !currentApprovedTypes.includes(type));
    if (missingTypes.length > 0) {
      currentApprovedTypes = [...new Set([...currentApprovedTypes, ...missingTypes])];
      user.providerTypes = currentApprovedTypes;
      userChanged = true;
      repairsMade.push(`Added missing provider types: ${missingTypes.join(', ')}`);
      console.log('Added missing provider types:', missingTypes);
    }

    // Set legacy providerType field if it's missing and there's only one approved type
    if (!user.providerType && currentApprovedTypes.length === 1) {
      user.providerType = currentApprovedTypes[0];
      userChanged = true;
      repairsMade.push(`Set legacy providerType to '${currentApprovedTypes[0]}'`);
    }

    // Save changes if any were made
    if (userChanged) {
      await user.save();
      console.log('User data after repair:', {
        userId,
        type: user.type,
        providerTypes: user.providerTypes,
        providerType: user.providerType
      });
    }

    res.status(200).json({
      success: true,
      message: userChanged ? "Provider data repaired successfully" : "No repairs needed",
      data: {
        userType: user.type,
        approvedTypes: user.providerTypes,
        legacyProviderType: user.providerType,
        repairsMade,
        approvedRequests: approvedRequests.map(req => ({
          providerType: req.providerType,
          approvedAt: req.reviewedAt
        }))
      }
    });

  } catch (error) {
    console.error("Error repairing provider data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  getProviderServices,
  createService,
  updateService,
  deleteService,
  getServiceById,
  getUserProviderStatus,
  repairProviderData
}; 
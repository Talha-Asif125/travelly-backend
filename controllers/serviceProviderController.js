const ServiceProviderRequest = require("../models/ServiceProviderRequest");
const User = require("../models/userModel");
const { createNotificationHelper } = require("./notificationController");

// Enhanced validation function
const validateProviderRequest = (data) => {
  const errors = {};
  const {
    firstName,
    lastName,
    providerType
  } = data;

  // Personal Information Validation
  if (!firstName || !firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!lastName || !lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  // Provider type validation
  if (!providerType || !providerType.trim()) {
    errors.providerType = "Service provider type is required";
  }

  // Debug: Show which provider type we're validating
  console.log('=== VALIDATION DEBUG ===');
  console.log('Validating provider type:', providerType);
  console.log('Provider type typeof:', typeof providerType);
  console.log('Provider type === "tour":', providerType === 'tour');
  console.log('Provider type === "vehicle":', providerType === 'vehicle'); 
  console.log('Provider type === "hotel":', providerType === 'hotel');
  console.log('Provider type === "restaurant":', providerType === 'restaurant');
  console.log('Provider type === "event":', providerType === 'event');

  // Tour business validation (simplified - only identity + documents)
  if (providerType === 'tour') {
    // Tour operators have simplified registration - no additional business details required
    console.log('✅ VALIDATION: Taking TOUR branch');
  } else if (providerType === 'vehicle') {
    console.log('✅ VALIDATION: Taking VEHICLE branch');
    // For vehicle providers, validate rental shop details
    if (!data.shopName || !data.shopName.trim()) {
      errors.shopName = "Rental shop name is required";
    }
    
    if (!data.shopCity || !data.shopCity.trim()) {
      errors.shopCity = "Shop city is required";
    }
    
    if (!data.shopAddress || !data.shopAddress.trim()) {
      errors.shopAddress = "Shop address is required";
    }
    
    if (!data.fleetSize || isNaN(data.fleetSize) || parseInt(data.fleetSize) <= 0) {
      errors.fleetSize = "Valid fleet size is required";
    }
    
    if (!data.shopPhone || !data.shopPhone.trim()) {
      errors.shopPhone = "Shop contact phone is required";
    } else if (!/^[0-9]{10,11}$/.test(data.shopPhone.replace(/\D/g, ''))) {
      errors.shopPhone = "Please enter a valid 10-11 digit shop phone number";
    }
    
    if (!data.shopDescription || !data.shopDescription.trim()) {
      errors.shopDescription = "Shop description is required";
    }
  } else if (providerType === 'hotel') {
    console.log('✅ VALIDATION: Taking HOTEL branch');
    // For hotels, validate hotel-specific details instead of business details
    if (!data.hotelName || !data.hotelName.trim()) {
      errors.hotelName = "Hotel name is required";
    }
    
    if (!data.hotelAddress || !data.hotelAddress.trim()) {
      errors.hotelAddress = "Hotel address is required";
    }
    
    if (!data.propertyType || !data.propertyType.trim()) {
      errors.propertyType = "Property type is required";
    }
    
    if (!data.numberOfRooms || isNaN(data.numberOfRooms) || parseInt(data.numberOfRooms) <= 0) {
      errors.numberOfRooms = "Valid number of rooms is required";
    }
    
    if (!data.starRating || isNaN(data.starRating) || parseInt(data.starRating) < 1 || parseInt(data.starRating) > 5) {
      errors.starRating = "Star rating must be between 1 and 5";
    }
    
    if (!data.priceRangeMin || isNaN(data.priceRangeMin) || parseFloat(data.priceRangeMin) <= 0) {
      errors.priceRangeMin = "Valid minimum price is required";
    }
    
    if (!data.priceRangeMax || isNaN(data.priceRangeMax) || parseFloat(data.priceRangeMax) <= 0) {
      errors.priceRangeMax = "Valid maximum price is required";
    }
    
    if (!data.hotelPhone || !data.hotelPhone.trim()) {
      errors.hotelPhone = "Hotel contact phone is required";
    } else if (!/^[0-9]{10,11}$/.test(data.hotelPhone.replace(/\D/g, ''))) {
      errors.hotelPhone = "Please enter a valid 10-11 digit hotel phone number";
    }
    
    if (!data.hotelEmail || !data.hotelEmail.trim()) {
      errors.hotelEmail = "Hotel contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.hotelEmail)) {
      errors.hotelEmail = "Please enter a valid hotel email address";
    }
  } else if (providerType === 'restaurant') {
    console.log('✅ VALIDATION: Taking RESTAURANT branch');
    // For restaurant providers, include restaurant details instead of business details
    if (!data.restaurantName || !data.restaurantName.trim()) {
      errors.restaurantName = "Restaurant name is required";
    }
    
    if (!data.restaurantAddress || !data.restaurantAddress.trim()) {
      errors.restaurantAddress = "Restaurant address is required";
    }
    
    if (!data.cuisineType || !data.cuisineType.trim()) {
      errors.cuisineType = "Cuisine type is required";
    }
    
    if (!data.seatingCapacity || isNaN(data.seatingCapacity) || parseInt(data.seatingCapacity) <= 0) {
      errors.seatingCapacity = "Valid seating capacity is required";
    }
    
    if (!data.restaurantPhone || !data.restaurantPhone.trim()) {
      errors.restaurantPhone = "Restaurant contact phone is required";
    } else if (!/^[0-9]{10,11}$/.test(data.restaurantPhone.replace(/\D/g, ''))) {
      errors.restaurantPhone = "Please enter a valid 10-11 digit restaurant phone number";
    }
    
    if (!data.restaurantEmail || !data.restaurantEmail.trim()) {
      errors.restaurantEmail = "Restaurant contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.restaurantEmail)) {
      errors.restaurantEmail = "Please enter a valid restaurant email address";
    }
  } else if (providerType === 'event') {
    console.log('✅ VALIDATION: Taking EVENT branch');
    // For event providers, include event details instead of business details
    if (!data.eventName || !data.eventName.trim()) {
      errors.eventName = "Event name is required";
    }
    
    if (!data.eventAddress || !data.eventAddress.trim()) {
      errors.eventAddress = "Event address is required";
    }
    
    if (!data.eventPhone || !data.eventPhone.trim()) {
      errors.eventPhone = "Event contact phone is required";
    } else if (!/^[0-9]{10,11}$/.test(data.eventPhone.replace(/\D/g, ''))) {
      errors.eventPhone = "Please enter a valid 10-11 digit event phone number";
    }
    
    if (!data.eventEmail || !data.eventEmail.trim()) {
      errors.eventEmail = "Event contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.eventEmail)) {
      errors.eventEmail = "Please enter a valid event email address";
    }
  } else {
    console.log('❌ VALIDATION: No matching provider type branch found!');
    console.log('Provider type value:', JSON.stringify(providerType));
  }
  // All provider types now use simplified registration - no traditional business validation needed

  console.log('=== END VALIDATION DEBUG ===');
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Submit a new service provider request
const submitProviderRequest = async (req, res) => {
  try {
    console.log('=== Service Provider Request Submission ===');
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    
    const {
      firstName,
      lastName,
      providerType,
      additionalInfo,
      vehicleDetails,
      documents,
      userId
    } = req.body;

    // Enhanced validation with specific field errors
    console.log('Starting validation...');
    console.log('Provider type from body:', providerType);
    console.log('All req.body keys:', Object.keys(req.body));
    console.log('Calling validateProviderRequest with:', {
      firstName,
      lastName, 
      providerType,
      sampleFields: {
        hotelName: req.body.hotelName,
        shopName: req.body.shopName,
        restaurantName: req.body.restaurantName
      }
    });
    const validation = validateProviderRequest(req.body);
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      const errorFields = Object.keys(validation.errors);
      const firstError = validation.errors[errorFields[0]];
      
      console.log('Validation failed:', validation.errors);
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${firstError}`,
        errors: validation.errors,
        fieldErrors: validation.errors // For compatibility with frontend
      });
    }

    console.log('Validation passed, checking existing requests...');
    
    // First, let's see ALL requests for this user and provider type for debugging
    const allUserRequests = await ServiceProviderRequest.find({
      userId: req.user.id,
      providerType: providerType
    }).sort({ submittedAt: -1 });
    
    console.log(`Found ${allUserRequests.length} total requests for user ${req.user.id} and provider type ${providerType}:`);
    allUserRequests.forEach((request, index) => {
      console.log(`  Request ${index + 1}: Status = ${request.status}, Date = ${request.submittedAt}`);
    });
    
    // Check if user already has a pending or approved request for this specific provider type
    // Note: Users can reapply if their previous request was rejected
    const existingRequest = await ServiceProviderRequest.findOne({
      userId: req.user.id,
      providerType: providerType,
      status: { $in: ['pending', 'approved'] }
    });

    console.log('Existing blocking request:', existingRequest);
    if (existingRequest) {
      console.log(`User already has a ${existingRequest.status} request for ${providerType}`);
      return res.status(400).json({
        success: false,
        message: `You already have a ${existingRequest.status} service provider request for ${providerType}. You can apply for other service types separately.`,
        debug: {
          existingStatus: existingRequest.status,
          existingDate: existingRequest.submittedAt,
          allRequests: allUserRequests.map(r => ({ status: r.status, date: r.submittedAt }))
        }
      });
    }

    console.log('Creating new service provider request...');
    
    // Prepare request data based on provider type
    const requestData = {
      userId: req.user.id,
      firstName,
      lastName,
      cnic: req.body.cnic,
      mobileForOTP: req.body.mobileForOTP,
      providerType,
      additionalInfo,
      status: 'pending'
    };

    // Add provider-type specific fields
    if (providerType === 'tour') {
      // For tour providers, simplified registration - only documents required
      if (documents) {
        requestData.documents = {
          cnicCopy: documents.cnicCopy,
          licensePhoto: documents.licensePhoto
        };
      }
    } else if (providerType === 'vehicle') {
      // For vehicle providers, include rental shop details
      requestData.shopName = req.body.shopName;
      requestData.shopCity = req.body.shopCity;
      requestData.shopAddress = req.body.shopAddress;
      requestData.fleetSize = req.body.fleetSize;
      requestData.shopPhone = req.body.shopPhone;
      requestData.shopDescription = req.body.shopDescription;
      if (documents) {
        requestData.documents = {
          cnicCopy: documents.cnicCopy,
          vehiclePhotos: documents.vehiclePhotos
        };
      }
    } else if (providerType === 'hotel') {
      // For hotel providers, include hotel details instead of business details
      requestData.hotelName = req.body.hotelName;
      requestData.hotelAddress = req.body.hotelAddress;
      requestData.propertyType = req.body.propertyType;
      requestData.numberOfRooms = req.body.numberOfRooms;
      requestData.starRating = req.body.starRating;
      requestData.priceRangeMin = req.body.priceRangeMin;
      requestData.priceRangeMax = req.body.priceRangeMax;
      requestData.hotelPhone = req.body.hotelPhone;
      requestData.hotelEmail = req.body.hotelEmail;
      requestData.amenities = req.body.amenities;
      if (documents) {
        requestData.documents = {
          cnicCopy: documents.cnicCopy,
          licensePhoto: documents.licensePhoto
        };
      }
    } else if (providerType === 'restaurant') {
      // For restaurant providers, include restaurant details
      requestData.restaurantName = req.body.restaurantName;
      requestData.restaurantAddress = req.body.restaurantAddress;
      requestData.cuisineType = req.body.cuisineType;
      requestData.seatingCapacity = req.body.seatingCapacity;
      requestData.restaurantPhone = req.body.restaurantPhone;
      requestData.restaurantEmail = req.body.restaurantEmail;
      if (documents) {
        requestData.documents = {
          cnicCopy: documents.cnicCopy,
          restaurantPhotos: documents.restaurantPhotos
        };
      }
    } else if (providerType === 'event') {
      // For event providers, include event details
      requestData.eventName = req.body.eventName;
      requestData.eventAddress = req.body.eventAddress;
      requestData.eventPhone = req.body.eventPhone;
      requestData.eventEmail = req.body.eventEmail;
      if (documents) {
        requestData.documents = {
          cnicCopy: documents.cnicCopy,
          eventPhotos: documents.eventPhotos
        };
      }
    }
    // Note: hotel, restaurant, event, vehicle, and tour providers use simplified registration

    // Create new service provider request
    const newRequest = new ServiceProviderRequest(requestData);

    console.log('New request object created:', newRequest);
    console.log('Attempting to save to database...');
    
    const savedRequest = await newRequest.save();
    console.log('Successfully saved to database!');
    console.log('Saved request:', savedRequest);

    // Send notification to user about successful submission
    try {
      await createNotificationHelper(
        req.user.id,
        'Service Provider Request Submitted',
        `Your request to become a ${selectedType} service provider has been submitted successfully! Our admin team will review your application and notify you of the decision within 2-3 business days.`,
        'provider_request_submitted',
        {
          providerType: selectedType,
          requestId: savedRequest._id,
          submittedAt: new Date()
        }
      );
    } catch (notifError) {
      console.error('Error sending submission notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: "Service provider request submitted successfully",
      data: savedRequest
    });

  } catch (error) {
    console.error("=== ERROR in submitProviderRequest ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all service provider requests (Admin only)
const getAllProviderRequests = async (req, res) => {
  try {
    const requests = await ServiceProviderRequest.find()
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error("Error fetching provider requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get service provider request by ID
const getProviderRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ServiceProviderRequest.findById(id)
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service provider request not found"
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error("Error fetching provider request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Approve service provider request (Admin only)
const approveProviderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const request = await ServiceProviderRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service provider request not found"
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed"
      });
    }

    // Update request status
    request.status = 'approved';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    await request.save();

    // Update user to add the new provider type to their approved types
    const user = await User.findById(request.userId);
    
    // Set user type to provider if not already
    if (user.type !== 'provider') {
      user.type = 'provider';
    }
    
    // Add the new provider type if not already present
    if (!user.providerTypes.includes(request.providerType)) {
      user.providerTypes.push(request.providerType);
    }
    
    // For backward compatibility, set providerType to the first approved type
    if (!user.providerType) {
      user.providerType = request.providerType;
    }
    
    await user.save();

    // Send notification to user about approval
    try {
      await createNotificationHelper(
        request.userId,
        'Service Provider Request Approved!',
        `Congratulations! Your request to become a ${request.providerType} service provider has been approved. You can now access your service provider dashboard and start adding your services.`,
        'provider_request_approved',
        {
          providerType: request.providerType,
          requestId: request._id,
          approvedBy: adminId,
          approvedAt: new Date()
        }
      );
    } catch (notifError) {
      console.error('Error sending approval notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: "Service provider request approved successfully",
      data: request
    });

  } catch (error) {
    console.error("Error approving provider request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Reject service provider request (Admin only)
const rejectProviderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }

    const request = await ServiceProviderRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service provider request not found"
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed"
      });
    }

    // Update request status
    request.status = 'rejected';
    request.rejectionReason = reason;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    await request.save();

    // Send notification to user about rejection
    try {
      await createNotificationHelper(
        request.userId,
        'Service Provider Request Update',
        `Your request to become a ${request.providerType} service provider has been declined. Reason: ${reason}. You can submit a new application after addressing the mentioned concerns.`,
        'provider_request_rejected',
        {
          providerType: request.providerType,
          requestId: request._id,
          reason: reason,
          rejectedBy: adminId,
          rejectedAt: new Date()
        }
      );
    } catch (notifError) {
      console.error('Error sending rejection notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: "Service provider request rejected successfully",
      data: request
    });

  } catch (error) {
    console.error("Error rejecting provider request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get user's own service provider requests
const getUserProviderRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await ServiceProviderRequest.find({ userId })
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error("Error fetching user provider requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  submitProviderRequest,
  getAllProviderRequests,
  getProviderRequestById,
  approveProviderRequest,
  rejectProviderRequest,
  getUserProviderRequests
}; 
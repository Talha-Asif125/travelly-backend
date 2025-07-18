const ServiceProviderRequest = require("../models/ServiceProviderRequest");
const User = require("../models/userModel");

// Enhanced validation function
const validateProviderRequest = (data) => {
  const errors = {};
  const {
    firstName,
    lastName,
    email,
    phone,
    businessName,
    businessAddress,
    businessCity,
    businessState,
    businessZip,
    businessPhone,
    businessEmail,
    businessWebsite,
    registrationNumber,
    licenseNumber,
    taxId,
    providerType,
    serviceDetails,
    experience,
    vehicleDetails
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

  // Tour business validation
  if (providerType === 'tour') {
    // For tour providers, validate tour business details instead of business details
    if (!req.body.tourCompanyName || !req.body.tourCompanyName.trim()) {
      errors.tourCompanyName = "Tour company name is required";
    }
    
    if (!req.body.yearsOfExperience || isNaN(req.body.yearsOfExperience) || parseInt(req.body.yearsOfExperience) < 0) {
      errors.yearsOfExperience = "Valid years of experience is required";
    }
    
    if (!req.body.serviceAreas || !req.body.serviceAreas.trim()) {
      errors.serviceAreas = "Service areas are required";
    }
    
    if (!req.body.tourSpecializations || !req.body.tourSpecializations.trim()) {
      errors.tourSpecializations = "Tour specializations are required";
    }
    
    if (!req.body.tourBusinessDescription || !req.body.tourBusinessDescription.trim()) {
      errors.tourBusinessDescription = "Business description is required";
    }
  } else if (providerType === 'vehicle') {
    // For vehicle providers, validate rental shop details
    if (!req.body.shopName || !req.body.shopName.trim()) {
      errors.shopName = "Rental shop name is required";
    }
    
    if (!req.body.shopCity || !req.body.shopCity.trim()) {
      errors.shopCity = "Shop city is required";
    }
    
    if (!req.body.shopAddress || !req.body.shopAddress.trim()) {
      errors.shopAddress = "Shop address is required";
    }
    
    if (!req.body.fleetSize || isNaN(req.body.fleetSize) || parseInt(req.body.fleetSize) <= 0) {
      errors.fleetSize = "Valid fleet size is required";
    }
    
    if (!req.body.yearsInBusiness || isNaN(req.body.yearsInBusiness) || parseInt(req.body.yearsInBusiness) < 0) {
      errors.yearsInBusiness = "Valid years in business is required";
    }
    
    if (!req.body.vehicleTypesAvailable || !req.body.vehicleTypesAvailable.trim()) {
      errors.vehicleTypesAvailable = "Vehicle types available is required";
    }
    
    if (!req.body.shopPhone || !req.body.shopPhone.trim()) {
      errors.shopPhone = "Shop contact phone is required";
    } else if (!/^[0-9]{10,11}$/.test(req.body.shopPhone.replace(/\D/g, ''))) {
      errors.shopPhone = "Please enter a valid 10-11 digit shop phone number";
    }
    
    if (!req.body.shopDescription || !req.body.shopDescription.trim()) {
      errors.shopDescription = "Shop description is required";
    }
  } else if (providerType === 'hotel') {
    // For hotels, validate hotel-specific details instead of business details
    if (!req.body.hotelName || !req.body.hotelName.trim()) {
      errors.hotelName = "Hotel name is required";
    }
    
    if (!req.body.hotelAddress || !req.body.hotelAddress.trim()) {
      errors.hotelAddress = "Hotel address is required";
    }
    
    if (!req.body.propertyType || !req.body.propertyType.trim()) {
      errors.propertyType = "Property type is required";
    }
    
    if (!req.body.numberOfRooms || isNaN(req.body.numberOfRooms) || parseInt(req.body.numberOfRooms) <= 0) {
      errors.numberOfRooms = "Valid number of rooms is required";
    }
    
    if (!req.body.starRating || isNaN(req.body.starRating) || parseInt(req.body.starRating) < 1 || parseInt(req.body.starRating) > 5) {
      errors.starRating = "Star rating must be between 1 and 5";
    }
    
    if (!req.body.priceRangeMin || isNaN(req.body.priceRangeMin) || parseFloat(req.body.priceRangeMin) <= 0) {
      errors.priceRangeMin = "Valid minimum price is required";
    }
    
    if (!req.body.priceRangeMax || isNaN(req.body.priceRangeMax) || parseFloat(req.body.priceRangeMax) <= 0) {
      errors.priceRangeMax = "Valid maximum price is required";
    }
    
    if (!req.body.hotelPhone || !req.body.hotelPhone.trim()) {
      errors.hotelPhone = "Hotel contact phone is required";
    } else if (!/^[0-9]{10,11}$/.test(req.body.hotelPhone.replace(/\D/g, ''))) {
      errors.hotelPhone = "Please enter a valid 10-11 digit hotel phone number";
    }
    
    if (!req.body.hotelEmail || !req.body.hotelEmail.trim()) {
      errors.hotelEmail = "Hotel contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.hotelEmail)) {
      errors.hotelEmail = "Please enter a valid hotel email address";
    }
  } else if (providerType === 'restaurant') {
    // For restaurant providers, include restaurant details instead of business details
    if (!req.body.restaurantName || !req.body.restaurantName.trim()) {
      errors.restaurantName = "Restaurant name is required";
    }
    
    if (!req.body.restaurantAddress || !req.body.restaurantAddress.trim()) {
      errors.restaurantAddress = "Restaurant address is required";
    }
    
    if (!req.body.cuisineType || !req.body.cuisineType.trim()) {
      errors.cuisineType = "Cuisine type is required";
    }
    
    if (!req.body.seatingCapacity || isNaN(req.body.seatingCapacity) || parseInt(req.body.seatingCapacity) <= 0) {
      errors.seatingCapacity = "Valid seating capacity is required";
    }
    
    if (!req.body.restaurantPhone || !req.body.restaurantPhone.trim()) {
      errors.restaurantPhone = "Restaurant contact phone is required";
    } else if (!/^[0-9]{10,11}$/.test(req.body.restaurantPhone.replace(/\D/g, ''))) {
      errors.restaurantPhone = "Please enter a valid 10-11 digit restaurant phone number";
    }
    
    if (!req.body.restaurantEmail || !req.body.restaurantEmail.trim()) {
      errors.restaurantEmail = "Restaurant contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.restaurantEmail)) {
      errors.restaurantEmail = "Please enter a valid restaurant email address";
    }
  } else if (providerType === 'event') {
    // For event providers, include event details instead of business details
    if (!req.body.eventName || !req.body.eventName.trim()) {
      errors.eventName = "Event name is required";
    }
    
    if (!req.body.eventAddress || !req.body.eventAddress.trim()) {
      errors.eventAddress = "Event address is required";
    }
    
    if (!req.body.eventPhone || !req.body.eventPhone.trim()) {
      errors.eventPhone = "Event contact phone is required";
    } else if (!/^[0-9]{10,11}$/.test(req.body.eventPhone.replace(/\D/g, ''))) {
      errors.eventPhone = "Please enter a valid 10-11 digit event phone number";
    }
    
    if (!req.body.eventEmail || !req.body.eventEmail.trim()) {
      errors.eventEmail = "Event contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.eventEmail)) {
      errors.eventEmail = "Please enter a valid event email address";
    }
  } else {
    // Non-vehicle provider validation (business details)
    if (!email || !email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!phone || !phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[0-9]{10,11}$/.test(phone.replace(/\D/g, ''))) {
      errors.phone = "Please enter a valid 10-11 digit phone number";
    }

    // Business Information Validation
    if (!businessName || !businessName.trim()) {
      errors.businessName = "Business name is required";
    }

    if (!businessAddress || !businessAddress.trim()) {
      errors.businessAddress = "Business address is required";
    }

    if (!businessCity || !businessCity.trim()) {
      errors.businessCity = "Business city is required";
    }

    if (!businessState || !businessState.trim()) {
      errors.businessState = "Business state is required";
    }

    if (!businessZip || !businessZip.trim()) {
      errors.businessZip = "ZIP code is required";
    } else if (!/^[0-9]{5}(-[0-9]{4})?$/.test(businessZip)) {
      errors.businessZip = "Please enter a valid ZIP code";
    }

    if (!businessPhone || !businessPhone.trim()) {
      errors.businessPhone = "Business phone number is required";
    } else if (!/^[0-9]{10,11}$/.test(businessPhone.replace(/\D/g, ''))) {
      errors.businessPhone = "Please enter a valid 10-11 digit business phone number";
    }

    if (!businessEmail || !businessEmail.trim()) {
      errors.businessEmail = "Business email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)) {
      errors.businessEmail = "Please enter a valid business email address";
    }

    // Business website is optional, but if provided, validate format
    if (businessWebsite && businessWebsite.trim() && !/^https?:\/\/.+\..+/.test(businessWebsite)) {
      errors.businessWebsite = "Please enter a valid website URL";
    }

    // Documentation Validation
    if (!registrationNumber || !registrationNumber.trim()) {
      errors.registrationNumber = "Business registration number is required";
    } else if (registrationNumber.length < 5) {
      errors.registrationNumber = "Please enter a valid business registration number";
    }

    if (!licenseNumber || !licenseNumber.trim()) {
      errors.licenseNumber = "License number is required";
    } else if (licenseNumber.length < 3) {
      errors.licenseNumber = "Please enter a valid license number";
    }

    if (!taxId || !taxId.trim()) {
      errors.taxId = "Tax ID is required";
    } else if (!/^[A-Z0-9\-]{3,20}$/.test(taxId)) {
      errors.taxId = "Please enter a valid tax ID (alphanumeric, 3-20 characters)";
    }

    if (!serviceDetails || !serviceDetails.trim()) {
      errors.serviceDetails = "Service details are required";
    }

    if (!experience) {
      errors.experience = "Years of experience is required";
    } else if (isNaN(experience) || parseFloat(experience) < 0) {
      errors.experience = "Please enter a valid number of years of experience";
    }
  }

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
      email,
      phone,
      businessName,
      businessAddress,
      businessCity,
      businessState,
      businessZip,
      businessPhone,
      businessEmail,
      businessWebsite,
      registrationNumber,
      licenseNumber,
      taxId,
      providerType,
      serviceDetails,
      experience,
      additionalInfo,
      vehicleDetails,
      documents,
      userId
    } = req.body;

    // Enhanced validation with specific field errors
    console.log('Starting validation...');
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
    // Check if user already has a pending or approved request for this specific provider type
    const existingRequest = await ServiceProviderRequest.findOne({
      userId: req.user.id,
      providerType: providerType,
      status: { $in: ['pending', 'approved'] }
    });

    console.log('Existing request check for provider type:', existingRequest);
    if (existingRequest) {
      console.log(`User already has a ${existingRequest.status} request for ${providerType}`);
      return res.status(400).json({
        success: false,
        message: `You already have a ${existingRequest.status} service provider request for ${providerType}. You can apply for other service types separately.`
      });
    }

    console.log('Creating new service provider request...');
    
    // Prepare request data based on provider type
    const requestData = {
      userId: req.user.id,
      firstName,
      lastName,
      providerType,
      additionalInfo,
      status: 'pending'
    };

    // Add provider-type specific fields
    if (providerType === 'tour') {
      // For tour providers, include tour business details instead of business details
      requestData.tourCompanyName = req.body.tourCompanyName;
      requestData.yearsOfExperience = req.body.yearsOfExperience;
      requestData.serviceAreas = req.body.serviceAreas;
      requestData.tourSpecializations = req.body.tourSpecializations;
      requestData.tourBusinessDescription = req.body.tourBusinessDescription;
      if (documents) {
        requestData.documents = {
          cnicCopy: documents.cnicFront || documents.cnicCopy,
          licensePhoto: documents.licensePhoto
        };
      }
    } else if (providerType === 'vehicle') {
      // For vehicle providers, include rental shop details instead of business details
      requestData.shopName = req.body.shopName;
      requestData.shopCity = req.body.shopCity;
      requestData.shopAddress = req.body.shopAddress;
      requestData.fleetSize = req.body.fleetSize;
      requestData.yearsInBusiness = req.body.yearsInBusiness;
      requestData.vehicleTypesAvailable = req.body.vehicleTypesAvailable;
      requestData.shopPhone = req.body.shopPhone;
      requestData.shopDescription = req.body.shopDescription;
      if (documents) {
        requestData.documents = {
          cnicCopy: documents.cnicFront || documents.cnicCopy,
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
          cnicCopy: documents.cnicFront || documents.cnicCopy,
          licensePhoto: documents.licensePhoto
        };
      }
    } else if (providerType === 'restaurant') {
      // For restaurant providers, include restaurant details instead of business details
      requestData.restaurantName = req.body.restaurantName;
      requestData.restaurantAddress = req.body.restaurantAddress;
      requestData.cuisineType = req.body.cuisineType;
      requestData.seatingCapacity = req.body.seatingCapacity;
      requestData.restaurantPhone = req.body.restaurantPhone;
      requestData.restaurantEmail = req.body.restaurantEmail;
      if (documents) {
        requestData.documents = {
          cnicCopy: documents.cnicFront || documents.cnicCopy,
          restaurantPhotos: documents.restaurantPhotos
        };
      }
    } else if (providerType === 'event') {
      // For event providers, include event details instead of business details
      requestData.eventName = req.body.eventName;
      requestData.eventAddress = req.body.eventAddress;
      requestData.eventPhone = req.body.eventPhone;
      requestData.eventEmail = req.body.eventEmail;
      if (documents) {
        requestData.documents = {
          cnicCopy: documents.cnicFront || documents.cnicCopy,
          eventPhotos: documents.eventPhotos
        };
      }
    } else {
      // For other non-vehicle providers, add full business details
      requestData.email = email;
      requestData.phone = phone;
      requestData.businessName = businessName;
      requestData.businessAddress = businessAddress;
      requestData.businessCity = businessCity;
      requestData.businessState = businessState;
      requestData.businessZip = businessZip;
      requestData.businessPhone = businessPhone;
      requestData.businessEmail = businessEmail;
      requestData.businessWebsite = businessWebsite;
      requestData.registrationNumber = registrationNumber;
      requestData.licenseNumber = licenseNumber;
      requestData.taxId = taxId;
      requestData.serviceDetails = serviceDetails;
      requestData.experience = experience;
      if (documents) {
        requestData.documents = documents;
      }
    }

    // Create new service provider request
    const newRequest = new ServiceProviderRequest(requestData);

    console.log('New request object created:', newRequest);
    console.log('Attempting to save to database...');
    
    const savedRequest = await newRequest.save();
    console.log('Successfully saved to database!');
    console.log('Saved request:', savedRequest);

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
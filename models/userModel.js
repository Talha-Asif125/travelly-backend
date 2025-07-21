const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    country: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    mobile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true,
      // enum :["user","admin"],
      // default : "users"
    },
    providerTypes: {
      type: [String],
      enum: ['hotel', 'vehicle', 'tour', 'restaurant', 'event'],
      default: [],
      validate: {
        validator: function(v) {
          // Only require if user type is provider
          return this.type !== 'provider' || (Array.isArray(v) && v.length > 0);
        },
        message: 'Provider must have at least one approved service type'
      }
    },
    // Legacy field for backward compatibility - will be deprecated
    providerType: {
      type: String,
      enum: ['hotel', 'vehicle', 'tour', 'restaurant', 'event']
    },
    pic: {
      type: String,
      required: true,
      default:
        "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // Email verification fields
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    // Password reset fields
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

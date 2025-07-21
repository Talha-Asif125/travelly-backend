require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

const verifyExistingUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travely');
    console.log('📊 Connected to database');

    // Find all unverified users
    const unverifiedUsers = await User.find({ 
      $or: [
        { isEmailVerified: false },
        { isEmailVerified: { $exists: false } }
      ]
    });

    console.log(`\n🔍 Found ${unverifiedUsers.length} unverified users`);

    if (unverifiedUsers.length === 0) {
      console.log('✅ All users are already verified!');
      await mongoose.disconnect();
      return;
    }

    // Update all existing users to verified
    const result = await User.updateMany(
      { 
        $or: [
          { isEmailVerified: false },
          { isEmailVerified: { $exists: false } }
        ]
      },
      { 
        $set: { 
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        }
      }
    );

    console.log(`\n✅ Successfully verified ${result.modifiedCount} existing users!`);
    
    // Show updated users
    const verifiedUsers = await User.find({ isEmailVerified: true });
    console.log('\n🎉 ALL VERIFIED USERS:');
    console.log('=====================================');
    verifiedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Type: ${user.type}`);
    });

    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
    console.log('\n🎯 All existing users can now login without email verification!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyExistingUsers(); 
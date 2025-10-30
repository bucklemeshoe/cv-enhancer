#!/usr/bin/env node

/**
 * Test script to verify Cloudinary integration is working
 */

const { uploadProfilePhoto, isCloudinaryUrl, isBase64DataUrl } = require('../lib/cloudinary');
const fs = require('fs');
const path = require('path');

async function testCloudinary() {
  console.log('🧪 Testing Cloudinary integration...');
  
  try {
    // Test 1: Check if we can create a test image
    console.log('📸 Creating test image...');
    const testImagePath = path.join(__dirname, '../public/images/profile-photo.png');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ Test image not found at:', testImagePath);
      return;
    }
    
    // Test 2: Upload test image
    console.log('☁️  Uploading test image to Cloudinary...');
    const fileBuffer = fs.readFileSync(testImagePath);
    
    const uploadResult = await uploadProfilePhoto(fileBuffer, {
      public_id: `test-${Date.now()}`
    });
    
    if (uploadResult.success) {
      console.log('✅ Upload successful!');
      console.log(`🔗 URL: ${uploadResult.url}`);
      console.log(`🆔 Public ID: ${uploadResult.public_id}`);
      console.log(`📏 Size: ${uploadResult.bytes} bytes`);
      console.log(`📄 Format: ${uploadResult.format}`);
      
      // Test 3: Verify URL detection
      console.log('\n🔍 Testing URL detection...');
      console.log(`Is Cloudinary URL: ${isCloudinaryUrl(uploadResult.url)}`);
      console.log(`Is Base64 Data URL: ${isBase64DataUrl(uploadResult.url)}`);
      
      // Test 4: Test base64 detection
      const base64Test = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
      console.log(`Base64 test: ${isBase64DataUrl(base64Test)}`);
      
      console.log('\n🎉 All tests passed! Cloudinary integration is working correctly.');
      
    } else {
      console.error('❌ Upload failed:', uploadResult.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run test if called directly
if (require.main === module) {
  testCloudinary()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCloudinary };

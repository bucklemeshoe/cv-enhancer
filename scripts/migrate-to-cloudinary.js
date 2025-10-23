#!/usr/bin/env node

/**
 * Migration script to convert existing base64 images to Cloudinary URLs
 * This script safely migrates existing submissions without data loss
 */

const { createClient } = require('@supabase/supabase-js');
const { uploadProfilePhoto, isBase64DataUrl, isCloudinaryUrl } = require('../lib/cloudinary');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function migrateToCloudinary() {
  console.log('🚀 Starting Cloudinary migration...');
  
  try {
    // Get all submissions with base64 profile pictures
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('id, unique_id, student_data')
      .not('student_data->profilePicture', 'is', null);
    
    if (fetchError) {
      throw new Error(`Failed to fetch submissions: ${fetchError.message}`);
    }
    
    console.log(`📊 Found ${submissions.length} submissions to check`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const submission of submissions) {
      const studentData = submission.student_data;
      const profilePicture = studentData.profilePicture;
      
      // Skip if already using Cloudinary
      if (isCloudinaryUrl(profilePicture)) {
        console.log(`⏭️  Skipping ${submission.unique_id} - already using Cloudinary`);
        skipped++;
        continue;
      }
      
      // Skip if not a base64 data URL
      if (!isBase64DataUrl(profilePicture)) {
        console.log(`⏭️  Skipping ${submission.unique_id} - not a base64 image`);
        skipped++;
        continue;
      }
      
      try {
        console.log(`🔄 Migrating ${submission.unique_id}...`);
        
        // Convert base64 to buffer
        const base64Data = profilePicture.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Upload to Cloudinary
        const uploadResult = await uploadProfilePhoto(buffer, {
          public_id: `cv-builder/profile-photos/${submission.unique_id}-${Date.now()}`
        });
        
        if (uploadResult.success) {
          // Update the submission with Cloudinary URL
          const updatedStudentData = {
            ...studentData,
            profilePicture: uploadResult.url,
            profilePictureCloudinary: uploadResult.url,
            profilePicturePublicId: uploadResult.public_id,
            profilePictureLegacy: profilePicture // Keep original as backup
          };
          
          const { error: updateError } = await supabase
            .from('submissions')
            .update({ student_data: updatedStudentData })
            .eq('id', submission.id);
          
          if (updateError) {
            throw new Error(`Failed to update submission: ${updateError.message}`);
          }
          
          console.log(`✅ Migrated ${submission.unique_id} - ${uploadResult.url}`);
          migrated++;
        } else {
          console.error(`❌ Failed to upload ${submission.unique_id}: ${uploadResult.error}`);
          errors++;
        }
        
      } catch (error) {
        console.error(`❌ Error migrating ${submission.unique_id}:`, error.message);
        errors++;
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${migrated + skipped + errors}`);
    
    if (migrated > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('💡 You can now remove the profilePictureLegacy field after verifying everything works.');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToCloudinary()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToCloudinary };

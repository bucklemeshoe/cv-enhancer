#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function debugCVData() {
  console.log('🔍 Debugging CV data issues...');
  
  try {
    // Check submissions
    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (subError) {
      console.error('❌ Submissions error:', subError);
      return;
    }
    
    console.log(`📊 Submissions (${submissions.length}):`);
    submissions.forEach((sub, i) => {
      const data = sub.student_data;
      console.log(`\n${i+1}. ${sub.unique_id}:`);
      console.log(`   Profile Picture: ${data.profilePicture ? 'EXISTS' : 'MISSING'}`);
      console.log(`   Video URL: ${data.videoUrl || 'NOT SET'}`);
      if (data.profilePicture) {
        console.log(`   Picture type: ${typeof data.profilePicture}`);
        console.log(`   Picture length: ${data.profilePicture.length}`);
      }
    });
    
    // Check published CVs
    const { data: published, error: pubError } = await supabase
      .from('published_cvs')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (pubError) {
      console.error('❌ Published CVs error:', pubError);
      return;
    }
    
    console.log(`\n📊 Published CVs (${published.length}):`);
    published.forEach((cv, i) => {
      const data = cv.cv_data;
      console.log(`\n${i+1}. ${cv.unique_id} (${cv.slug}):`);
      console.log(`   Profile Picture: ${data.header?.photo ? 'EXISTS' : 'MISSING'}`);
      console.log(`   Video URL: ${data.videoUrl || 'NOT SET'}`);
      console.log(`   Header Video URL: ${data.header?.videoUrl || 'NOT SET'}`);
      if (data.header?.photo) {
        console.log(`   Picture type: ${typeof data.header.photo}`);
        console.log(`   Picture length: ${data.header.photo.length}`);
      }
    });
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

debugCVData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Debug failed:', error);
    process.exit(1);
  });

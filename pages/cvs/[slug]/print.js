import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'

// Import print-optimized components
import PrintHeader from '../../../components/print/PrintHeader'
import PrintProfile from '../../../components/print/PrintProfile'
import PrintExperience from '../../../components/print/PrintExperience'
import PrintEducation from '../../../components/print/PrintEducation'
import PrintSkills from '../../../components/print/PrintSkills'
import PrintCertifications from '../../../components/print/PrintCertifications'
import PrintContact from '../../../components/print/PrintContact'
import PrintHobbies from '../../../components/print/PrintHobbies'
import PrintReferences from '../../../components/print/PrintReferences'
import WavePattern from '../../../components/WavePattern'

export default function PrintCV({ cvData, slug }) {
  if (!cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CV Not Found</h1>
          <p className="text-gray-600">The requested CV could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{cvData.header?.name ? `${cvData.header.name} - CV (Print)` : 'CV (Print)'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico?v=4" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles/print.css" media="all" />
      </Head>

      <main className="print-cv bg-white min-h-screen">
        {/* No-print controls */}
        <div className="no-print bg-gray-100 p-4 text-center shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Print Preview</h1>
              <p className="text-sm text-gray-600">Optimized for A4 paper • Professional layout • Ready to print</p>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ← Back to CV
              </button>
              <button
                onClick={async (event) => {
                  try {
                    // Dynamically import the libraries
                    const html2canvas = (await import('html2canvas')).default;
                    const jsPDF = (await import('jspdf')).jsPDF;
                    
                    // Show loading state
                    const button = event.target;
                    const originalText = button.textContent;
                    button.textContent = '⏳ Generating...';
                    button.disabled = true;
                    
                    // Hide the no-print section temporarily
                    const noPrintSection = document.querySelector('.no-print');
                    noPrintSection.style.display = 'none';
                    
                    // Capture the CV content
                    const cvElement = document.querySelector('.print-container');
                    const canvas = await html2canvas(cvElement, {
                      scale: 2, // Higher quality
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: '#ffffff',
                      width: cvElement.scrollWidth,
                      height: cvElement.scrollHeight
                    });
                    
                    // Show no-print section again
                    noPrintSection.style.display = 'block';
                    
                    // Create PDF
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    
                    // Calculate dimensions to fit A4
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;
                    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                    const imgX = (pdfWidth - imgWidth * ratio) / 2;
                    const imgY = 0;
                    
                    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                    
                    // Generate filename
                    const name = cvData?.header?.name?.replace(/\s+/g, '-') || 'cv';
                    const fileName = `${name}-CV.pdf`;
                    
                    // Download PDF
                    pdf.save(fileName);
                    
                    // Reset button
                    button.textContent = originalText;
                    button.disabled = false;
                    
                  } catch (error) {
                    console.error('PDF generation failed:', error);
                    alert('Failed to generate PDF. Please try again or use the print option.');
                    // Reset button on error
                    event.target.textContent = 'Download PDF';
                    event.target.disabled = false;
                    // Show no-print section again
                    document.querySelector('.no-print').style.display = 'block';
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-700 border border-transparent rounded-md hover:bg-teal-800 transition-colors shadow-md"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Print-optimized CV content */}
        <div className="print-container max-w-4xl mx-auto bg-white">
          <div className="print-page relative">
            
            {/* Top Wave Pattern - Background */}
            <div className="absolute top-0 left-0 w-full z-0 print-wave">
              <WavePattern position="top" color="white" bgColor="teal-bright" />
            </div>
            
            {/* Compact Header */}
            <div className="relative z-10 mx-6 pt-4">
              <PrintHeader header={cvData.header} />
            </div>
            
            {/* Main Layout: Two Columns */}
            <div className="print-content grid grid-cols-3 gap-6 mt-8 mx-6 relative z-10">
              
              {/* Left Column - Main Content */}
              <div className="col-span-2 space-y-6">
                <PrintProfile profile={cvData.profile} />
                <PrintCertifications certifications={cvData.certifications} />
                <PrintExperience experience={cvData.experience} />
              </div>
              
              {/* Right Column - Personal Info & Skills */}
              <div className="col-span-1 space-y-6">
                <PrintContact personalInformation={cvData.personalInformation} />
                <PrintSkills skills={cvData.skills} />
                <PrintHobbies hobbies={cvData.hobbiesAndInterests} />
                <PrintEducation education={cvData.education} />
                <PrintReferences references={cvData.references} />
              </div>
              
            </div>
            
            {/* Bottom Wave Pattern - Background */}
            <div className="absolute bottom-0 left-0 w-full z-0 print-wave">
              <WavePattern position="bottom" color="white" bgColor="teal-bright" />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get published CV from Supabase by slug
    const { data: publishedCV, error } = await supabase
      .from('published_cvs')
      .select('cv_data')
      .eq('slug', slug)
      .single()

    if (error || !publishedCV) {
      console.error('Error loading CV data from Supabase:', error)
      return {
        props: {
          cvData: null,
          slug
        }
      }
    }

    return {
      props: {
        cvData: publishedCV.cv_data,
        slug
      }
    }
  } catch (error) {
    console.error('Error loading CV data:', error)
    return {
      props: {
        cvData: null,
        slug
      }
    }
  }
} 
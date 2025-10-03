import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'

// Import digital CV components (same as main CV page)
import Header from '../../../components/Header'
import PersonalInfo from '../../../components/PersonalInfo'
import Skills from '../../../components/Skills'
import Profile from '../../../components/Profile'
import Certifications from '../../../components/Certifications'
import ExperienceList from '../../../components/ExperienceList'
import Hobbies from '../../../components/Hobbies'
import EducationList from '../../../components/EducationList'
import ReferencesList from '../../../components/ReferencesList'

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
        <style>{`
          /* Remove bounding boxes for print */
          .cv-content .bg-white {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0.5rem 0 !important;
          }
          
          .cv-content .rounded-lg,
          .cv-content .shadow-sm,
          .cv-content .border-gray-200 {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          /* Reduce gaps further (total 20px reduction) */
          .cv-content .space-y-6 > *,
          .cv-content .space-y-8 > * {
            margin-bottom: 0.375rem !important; /* 6px */
          }
          
          /* Specific gap reductions */
          .cv-content header {
            margin-bottom: 0.375rem !important;
          }
          
          .cv-content #summary,
          .cv-content #certifications,
          .cv-content #experience,
          .cv-content #skills,
          .cv-content #education,
          .cv-content #references {
            margin-bottom: 0.375rem !important;
          }
          
          /* Remove badge next to Education */
          #education .inline-flex,
          #education .rounded-full,
          #education .bg-blue-50,
          #education .bg-teal-50 {
            display: none !important;
          }
          
          /* Align header content with body content */
          .cv-content header {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          
          .cv-content header > div {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          
          .cv-content header .max-w-7xl {
            max-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          
          /* Professional Summary text size */
          #summary p {
            font-size: 12px !important;
          }
          
          /* Multi-page print handling */
          @media print {
            /* Prevent sections from breaking */
            #summary, #certifications, #experience, #skills, 
            #education, #references {
              page-break-inside: avoid;
            }
            
            /* Prevent individual items from breaking */
            #experience > div > div,
            #education > div > div,
            #references > div > div {
              page-break-inside: avoid;
            }
          }
        `}</style>
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

        {/* Print-optimized CV content - Match digital layout */}
        <div className="w-full bg-white">
          <div className="cv-content">
            
            {/* Top Wave */}
            <svg width="100%" height="50" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{display: 'block'}}>
              <path d="M1440,224L1380,213.3C1320,203,1200,181,1080,181.3C960,181,840,203,720,192C600,181,480,139,360,106.7C240,75,120,53,60,42.7L0,32L0,0L60,0C120,0,240,0,360,0C480,0,600,0,720,0C840,0,960,0,1080,0C1200,0,1320,0,1380,0L1440,0Z" fill="#F1F8F8"/>
            </svg>
            
            <div className="mx-auto px-8">
              {/* Header - Same as digital */}
              <Header header={cvData.header} />
              
              {/* Main Content - Two Column Grid (Same as digital) */}
              <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Column (≈ 65%) - Main Content */}
                <div className="md:col-span-8 space-y-6 lg:space-y-8">
                  
                  {/* Professional Summary */}
                  <div id="summary">
                    <Profile profile={cvData.profile} />
                  </div>

                  {/* Certifications */}
                  <div id="certifications">
                    <Certifications certifications={cvData.certifications} />
                  </div>

                  {/* Work Experience */}
                  <div id="experience">
                    <ExperienceList experience={cvData.experience} />
                  </div>

                </div>

                {/* Right Column (≈ 35%) */}
                <div className="md:col-span-4 space-y-6 lg:space-y-8">
                  
                  {/* Personal Information */}
                  <PersonalInfo personalInformation={cvData.personalInformation} />

                  {/* Skills */}
                  <div id="skills">
                    <Skills skills={cvData.skills} />
                  </div>

                  {/* Hobbies & Interests */}
                  <Hobbies hobbies={cvData.hobbiesAndInterests} />

                  {/* Education */}
                  <div id="education">
                    <EducationList education={cvData.education} highestQualification={cvData.highestQualification} />
                  </div>

                  {/* References */}
                  <div id="references">
                    <ReferencesList references={cvData.references} />
                  </div>

                </div>
              </div>
              </div>
            </div>
            
            {/* Bottom Wave */}
            <svg width="100%" height="50" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{display: 'block', marginTop: '2rem'}}>
              <path d="M0,96L60,106.7C120,117,240,139,360,138.7C480,139,600,117,720,128C840,139,960,181,1080,213.3C1200,245,1320,267,1380,277.3L1440,288L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" fill="#F1F8F8"/>
            </svg>
            
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
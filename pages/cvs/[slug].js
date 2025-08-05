import Head from 'next/head'
import fs from 'fs'
import path from 'path'

// Import all CV components - matching template structure
import Navigation from '../../components/Navigation'
import Header from '../../components/Header'
import PersonalInfo from '../../components/PersonalInfo'
import Skills from '../../components/Skills'
import Profile from '../../components/Profile'
import Certifications from '../../components/Certifications'
import ExperienceList from '../../components/ExperienceList'
import Hobbies from '../../components/Hobbies'
import EducationList from '../../components/EducationList'
import ReferencesList from '../../components/ReferencesList'
import Footer from '../../components/Footer'
import WavePattern from '../../components/WavePattern'

export default function CVPage({ cvData, slug }) {
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
        <title>{cvData.header?.name ? `${cvData.header.name} - CV` : 'CV'}</title>
        <meta name="description" content={cvData.profile || 'Professional CV'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico?v=4" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=4" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png?v=4" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png?v=4" />
        {/* Add Google Fonts for better typography */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation />

        {/* Top Wave Pattern */}
        <WavePattern position="top" color="white" bgColor="teal-bright" />

        {/* Header Section */}
        <Header header={cvData.header} />

        {/* Main Two-Column Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column (≈ 65%) */}
            <div className="md:col-span-8 space-y-6 lg:space-y-8">
              
              {/* Profile/Summary Section */}
              <div id="summary">
                <Profile profile={cvData.profile} />
              </div>

              {/* Certifications Section */}
              <div id="certifications">
                <Certifications certifications={cvData.certifications} />
              </div>

              {/* Work Experience Section */}
              <div id="experience">
                <ExperienceList experience={cvData.experience} />
              </div>

            </div>

            {/* Right Column (≈ 35%) */}
            <div className="md:col-span-4 space-y-6 lg:space-y-8">
              
              {/* Personal Information Section */}
              <PersonalInfo personalInformation={cvData.personalInformation} />

              {/* Skills Section */}
              <div id="skills">
                <Skills skills={cvData.skills} />
              </div>

              {/* Hobbies & Interests Section */}
              <Hobbies hobbies={cvData.hobbiesAndInterests} />

              {/* Education Section */}
              <div id="education">
                <EducationList education={cvData.education} highestQualification={cvData.highestQualification} />
              </div>

              {/* References Section */}
              <div id="references">
                <ReferencesList references={cvData.references} />
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Wave Pattern */}
        <WavePattern position="bottom" color="white" bgColor="teal-bright" />

        {/* Footer */}
        <Footer header={cvData.header} />

        {/* Print Instructions */}
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 print:hidden">
          <div className="space-y-2">
            <button 
              onClick={() => window.open(`/cvs/${slug}/print`, '_blank')}
              className="block w-full text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg transition-colors text-xs md:text-sm font-medium"
              style={{ backgroundColor: '#255156' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e4147'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#255156'}
            >
              🖨️ Print CV
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
                  button.textContent = '⏳ Generating PDF...';
                  button.disabled = true;
                  
                  // Hide the print buttons temporarily
                  const printButtons = document.querySelector('.fixed.bottom-4');
                  printButtons.style.display = 'none';
                  
                  // Capture the CV content
                  const cvElement = document.querySelector('main');
                  const canvas = await html2canvas(cvElement, {
                    scale: 2, // Higher quality
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    width: cvElement.scrollWidth,
                    height: cvElement.scrollHeight
                  });
                  
                  // Show print buttons again
                  printButtons.style.display = 'block';
                  
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
                  event.target.textContent = '📥 Download PDF';
                  event.target.disabled = false;
                  // Show print buttons again
                  document.querySelector('.fixed.bottom-4').style.display = 'block';
                }
              }}
              className="block w-full text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg transition-colors text-xs md:text-sm font-medium bg-green-600 hover:bg-green-700"
            >
              📥 Download PDF
            </button>
            <button 
              onClick={() => window.print()}
              className="block w-full text-gray-700 px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg transition-colors text-xs md:text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50"
            >
              📄 Quick Print
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params
  
  try {
    // Extract uniqueId from slug (format: firstname-lastname-uniqueid)
    const slugParts = slug.split('-')
    const uniqueId = slugParts[slugParts.length - 1]?.toUpperCase()
    
    if (!uniqueId) {
      return {
        props: {
          cvData: null,
          slug
        }
      }
    }

    // Read the JSON file for the requested CV
    const filePath = path.join(process.cwd(), 'data', 'published', `${uniqueId}.json`)
    
    if (!fs.existsSync(filePath)) {
      return {
        props: {
          cvData: null,
          slug
        }
      }
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const publishedData = JSON.parse(fileContent)

    // Handle both old format (direct CV data) and new format (wrapped in cvData)
    let cvData = null
    if (publishedData.cvData) {
      // New format: { cvData: {...}, uniqueId: "...", slug: "..." }
      cvData = publishedData.cvData
    } else if (publishedData.header) {
      // Old format: direct CV data object
      cvData = publishedData
    }

    if (!cvData) {
      return {
        props: {
          cvData: null,
          slug
        }
      }
    }
    
    return {
      props: {
        cvData: cvData,
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
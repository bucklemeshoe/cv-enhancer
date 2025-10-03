import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'

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

        {/* CV Content Container for PDF Export */}
        <div className="cv-content">
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
          <div className="relative" style={{ boxShadow: 'none', filter: 'none' }}>
        <WavePattern position="bottom" color="white" bgColor="teal-bright" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ boxShadow: 'none', filter: 'none', border: 'none', margin: 0, padding: 0 }}>
        <Footer header={cvData.header} />
        </div>

        {/* Print Instructions */}
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 print:hidden">
          <div className="space-y-2">
            <button 
              onClick={async (event) => {
                try {
                  // Dynamically import the libraries
                  const html2canvas = (await import('html2canvas')).default;
                  const jsPDF = (await import('jspdf')).jsPDF;
                  
                  // Show loading state
                  const button = event.target;
                  const originalText = button.textContent;
                  button.textContent = 'Generating PDF...';
                  button.disabled = true;
                  
                  // Create loading overlay
                  const overlay = document.createElement('div');
                  overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.95);
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(4px);
                  `;
                  overlay.innerHTML = `
                    <div style="text-align: center;">
                      <div style="
                        width: 48px;
                        height: 48px;
                        border: 4px solid #f3f4f6;
                        border-top-color: #5bb3b8;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 16px;
                      "></div>
                      <p style="
                        color: #374151;
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 8px;
                      ">Generating Your PDF</p>
                      <p style="
                        color: #6b7280;
                        font-size: 14px;
                      ">This may take a few moments...</p>
                    </div>
                    <style>
                      @keyframes spin {
                        to { transform: rotate(360deg); }
                      }
                    </style>
                  `;
                  document.body.appendChild(overlay);
                  
                  // Hide the print buttons temporarily
                  const printButtons = document.querySelector('.fixed.bottom-4');
                  printButtons.style.display = 'none';
                  
                  // Add PDF capturing class to switch to PDF-friendly styles
                  const cvElement = document.querySelector('.cv-content');
                  cvElement.classList.add('pdf-capturing');
                  
                  // Force desktop layout for capture
                  const originalWidth = cvElement.style.width;
                  cvElement.style.minWidth = '1024px'; // Force desktop width (lg breakpoint)
                  cvElement.style.width = '1024px';
                  
                  // Wait a moment for React to re-render with PDF styles and desktop layout
                  await new Promise(resolve => setTimeout(resolve, 300));
                  
                  // Capture only the CV content (excluding Navigation and Footer)
                  const canvas = await html2canvas(cvElement, {
                    scale: 2, // Higher quality
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    width: 1024, // Force desktop width
                    height: cvElement.scrollHeight,
                    windowWidth: 1024 // Render at desktop width
                  });
                  
                  // Restore original width
                  cvElement.style.width = originalWidth;
                  cvElement.style.minWidth = '';
                  
                  // Remove PDF capturing class and show print buttons again
                  cvElement.classList.remove('pdf-capturing');
                  printButtons.style.display = 'block';
                  
                  // Create wave images
                  const createWaveImage = async (isTop) => {
                    const wavePath = isTop 
                      ? "M1440,224L1380,213.3C1320,203,1200,181,1080,181.3C960,181,840,203,720,192C600,181,480,139,360,106.7C240,75,120,53,60,42.7L0,32L0,0L60,0C120,0,240,0,360,0C480,0,600,0,720,0C840,0,960,0,1080,0C1200,0,1320,0,1380,0L1440,0Z"
                      : "M0,96L60,106.7C120,117,240,139,360,138.7C480,139,600,117,720,128C840,139,960,181,1080,213.3C1200,245,1320,267,1380,277.3L1440,288L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z";
                    
                    const svgString = `<svg width="1440" height="320" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path d="${wavePath}" fill="#F1F8F8"/></svg>`;
                    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const img = new Image();
                    
                    return new Promise((resolve, reject) => {
                      img.onload = () => {
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = 1440;
                        tempCanvas.height = 320;
                        const ctx = tempCanvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        URL.revokeObjectURL(url);
                        resolve(tempCanvas.toDataURL('image/png'));
                      };
                      img.onerror = reject;
                      img.src = url;
                    });
                  };
                  
                  const topWaveImage = await createWaveImage(true);
                  const bottomWaveImage = await createWaveImage(false);
                  
                  // Create PDF with multi-page support
                  const imgData = canvas.toDataURL('image/png');
                  const pdf = new jsPDF('p', 'mm', 'a4');
                  
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = pdf.internal.pageSize.getHeight();
                  const waveHeight = 15; // Wave decoration height in mm
                  
                  // Calculate content dimensions
                  const contentWidth = pdfWidth - 20; // 10mm margins on sides
                  const contentHeight = (canvas.height * contentWidth) / canvas.width;
                  
                  // Available content height per page (accounting for waves)
                  const contentAreaHeight = pdfHeight - (waveHeight * 2) - 10;
                  
                  // Calculate pages needed
                  const totalPages = Math.ceil(contentHeight / contentAreaHeight);
                  
                  // Generate each page
                  for (let page = 0; page < totalPages; page++) {
                    if (page > 0) {
                      pdf.addPage();
                    }
                    
                    // Add top wave
                    pdf.addImage(topWaveImage, 'PNG', 0, 0, pdfWidth, waveHeight);
                    
                    // Calculate content slice for this page
                    const sourceY = page * contentAreaHeight * (canvas.height / contentHeight);
                    const sourceHeight = Math.min(
                      contentAreaHeight * (canvas.height / contentHeight),
                      canvas.height - sourceY
                    );
                    
                    // Create temp canvas for content slice
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = sourceHeight;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    tempCtx.drawImage(
                      canvas,
                      0, sourceY,
                      canvas.width, sourceHeight,
                      0, 0,
                      canvas.width, sourceHeight
                    );
                    
                    // Add content slice
                    const sliceData = tempCanvas.toDataURL('image/png');
                    const sliceHeight = (sourceHeight * contentWidth) / canvas.width;
                    const contentY = waveHeight + 5;
                    pdf.addImage(sliceData, 'PNG', 10, contentY, contentWidth, sliceHeight);
                    
                    // Add bottom wave
                    const bottomWaveY = pdfHeight - waveHeight;
                    pdf.addImage(bottomWaveImage, 'PNG', 0, bottomWaveY, pdfWidth, waveHeight);
                  }
                  
                  // Generate filename
                  const name = cvData?.header?.name?.replace(/\s+/g, '-') || 'cv';
                  const fileName = `${name}-CV.pdf`;
                  
                  // Download PDF
                  pdf.save(fileName);
                  
                  // Remove overlay
                  if (overlay && overlay.parentNode) {
                    document.body.removeChild(overlay);
                  }
                  
                  // Reset button
                  button.textContent = originalText;
                  button.disabled = false;
                  
                } catch (error) {
                  console.error('PDF generation failed:', error);
                  alert('Failed to generate PDF. Please try again or use the print option.');
                  
                  // Remove overlay on error
                  const overlay = document.querySelector('[style*="z-index: 9999"]');
                  if (overlay && overlay.parentNode) {
                    document.body.removeChild(overlay);
                  }
                  
                  // Reset button on error
                  event.target.textContent = 'Download PDF';
                  event.target.disabled = false;
                  // Show print buttons again
                  document.querySelector('.fixed.bottom-4').style.display = 'block';
                }
              }}
              className="block w-full text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg transition-colors text-xs md:text-sm font-medium bg-teal-700 hover:bg-teal-800"
            >
              Download PDF
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
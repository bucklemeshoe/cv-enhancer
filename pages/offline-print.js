import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'

// Import CV components
import Header from '../components/Header'
import PersonalInfo from '../components/PersonalInfo'
import Skills from '../components/Skills'
import Profile from '../components/Profile'
import Certifications from '../components/Certifications'
import ExperienceList from '../components/ExperienceList'
import Hobbies from '../components/Hobbies'
import EducationList from '../components/EducationList'
import ReferencesList from '../components/ReferencesList'
import WavePattern from '../components/WavePattern'

export default function OfflinePrint({ cvData, slug }) {
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
        <title>{cvData.header?.name ? `${cvData.header.name} - CV (Offline Print)` : 'CV (Offline Print)'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico?v=4" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          /* Offline Print Optimizations */
          @page {
            size: A4 portrait;
            margin: 0.5in;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Hide all interactive elements for offline print */
          .no-print,
          button,
          .print-controls,
          .hover\\:bg-gray-50:hover,
          .cursor-pointer,
          .group:hover .opacity-0 {
            display: none !important;
          }
          
          /* Optimize for print */
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Remove all shadows and borders for clean print */
          * {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          /* Optimize header for print */
          .print-header {
            margin-bottom: 20pt;
            padding-bottom: 10pt;
            border-bottom: 1pt solid #ccc;
          }
          
          /* Optimize content sections */
          .print-section {
            margin-bottom: 12pt;
            page-break-inside: avoid;
          }
          
          /* Ensure badge is visible in print */
          .print-badge {
            width: 60pt !important;
            height: 60pt !important;
            margin-right: 20pt !important;
          }
          
          /* Optimize text sizes for print */
          h1 { font-size: 18pt; font-weight: bold; margin-bottom: 4pt; }
          h2 { font-size: 14pt; font-weight: 600; margin-bottom: 6pt; }
          h3 { font-size: 11pt; font-weight: 600; margin-bottom: 4pt; }
          p { font-size: 10pt; line-height: 1.4; margin-bottom: 4pt; }
          
          /* Remove gradients and animations for print */
          .bg-gradient-to-r,
          .animate-gradient,
          .animate-pulse {
            background: #f0f0f0 !important;
            animation: none !important;
          }
          
          /* Ensure proper page breaks */
          .page-break-before { page-break-before: always; }
          .page-break-after { page-break-after: always; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          
          /* Optimize wave patterns for print */
          svg {
            height: 30pt !important;
            fill: #f0f0f0 !important;
          }
        `}</style>
      </Head>

      <main className="offline-print bg-white min-h-screen">
        {/* Print Controls - Hidden in actual print */}
        <div className="no-print bg-gray-100 p-4 text-center shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Offline Print Version</h1>
              <p className="text-sm text-gray-600">Optimized for offline printing • No internet required • Professional layout</p>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ← Back to CV
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-700 border border-transparent rounded-md hover:bg-teal-800 transition-colors"
              >
                🖨️ Print Now
              </button>
            </div>
          </div>
        </div>

        {/* Print-optimized CV content */}
        <div className="print-container w-full bg-white">
          <div className="cv-content">
            
            {/* Top Wave Pattern */}
            <WavePattern position="top" color="white" bgColor="teal-bright" />
            
            <div className="mx-auto px-8">
              {/* Header Section */}
              <Header header={{...cvData.header, videoUrl: cvData.videoUrl, showBadge: cvData.header.showBadge}} />
              
              {/* Main Content - Two Column Grid */}
              <div className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column (≈ 65%) - Main Content */}
                  <div className="md:col-span-8 space-y-6 lg:space-y-8">
                    
                    {/* Professional Summary */}
                    <div className="print-section">
                      <Profile profile={cvData.profile} />
                    </div>

                    {/* Certifications */}
                    <div className="print-section">
                      <Certifications certifications={cvData.certifications} />
                    </div>

                    {/* Work Experience */}
                    <div className="print-section">
                      <ExperienceList experience={cvData.experience} />
                    </div>

                  </div>

                  {/* Right Column (≈ 35%) */}
                  <div className="md:col-span-4 space-y-6 lg:space-y-8">
                    
                    {/* Personal Information */}
                    <div className="print-section">
                      <PersonalInfo personalInformation={cvData.personalInformation} />
                    </div>

                    {/* Skills */}
                    <div className="print-section">
                      <Skills skills={cvData.skills} />
                    </div>

                    {/* Hobbies & Interests */}
                    <div className="print-section">
                      <Hobbies hobbies={cvData.hobbiesAndInterests} />
                    </div>

                    {/* Education */}
                    <div className="print-section">
                      <EducationList education={cvData.education} highestQualification={cvData.highestQualification} />
                    </div>

                    {/* References */}
                    <div className="print-section">
                      <ReferencesList references={cvData.references} />
                    </div>

                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Wave Pattern */}
            <WavePattern position="bottom" color="white" bgColor="teal-bright" />
            
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



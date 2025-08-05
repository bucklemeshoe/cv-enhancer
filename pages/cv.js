import Head from 'next/head'
import { cvData } from '../data/cv-data'

// Import all CV components
import Navigation from '../components/Navigation'
import Header from '../components/Header'
import PersonalInfo from '../components/PersonalInfo'
import Skills from '../components/Skills'
import Profile from '../components/Profile'
import Certifications from '../components/Certifications'
import ExperienceList from '../components/ExperienceList'
import Hobbies from '../components/Hobbies'
import EducationList from '../components/EducationList'
import ReferencesList from '../components/ReferencesList'
import Footer from '../components/Footer'
import WavePattern from '../components/WavePattern'

export default function CV() {
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
              onClick={() => window.open('/cvs/jared-smith/print', '_blank')}
              className="block w-full text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg transition-colors text-xs md:text-sm font-medium"
              style={{ backgroundColor: '#255156' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e4147'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#255156'}
            >
              🖨️ Print CV
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
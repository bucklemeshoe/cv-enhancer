import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Professional Yacht Crew CV Builder - Pull North</title>
        <meta name="description" content="Professional CV enhancement service for yacht crew members" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico?v=4" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=4" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png?v=4" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png?v=4" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Karla:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />

      </Head>

            <div 
        className="min-h-screen bg-gray-50 relative"
        style={{
          backgroundImage: 'url(/images/home-page-gb_ane-kuun.JPG)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background Overlay for Better Text Readability */}
        <div className="absolute inset-0 bg-white bg-opacity-75"></div>
        
        {/* Notification Banner removed (promotion ended) */}
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 relative z-10">
          <div className="w-full px-4 py-4 sm:py-6">
            <div className="max-w-6xl mx-auto flex flex-row items-center justify-between">
              <img 
                src="/images/pull-north_logo.png" 
                alt="Pull North Logo" 
                className="h-12 sm:h-16 w-auto object-contain"
              />
              <Link href="/admin">
                <button className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-teal-600 hover:border-teal-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                  Admin Login
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-6xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center mb-16">
            {/* Badge */}
                         <div className="inline-flex items-center px-4 py-2 bg-teal-50 border border-teal-200 rounded-full text-teal-700 text-sm font-medium mb-8">
               Career Services
             </div>

                                      {/* Main Heading */}
             <h1 className="text-4xl md:text-6xl font-extrabold mb-4 font-heading max-w-4xl mx-auto leading-tight" style={{ color: '#3e3e3e' }}>
               Transform Your Yachting
               <span className="block">Experience Into a</span>
               <span className="block text-teal-600">Professional CV</span>
             </h1>

             {/* Subheading */}
             <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto mb-12 leading-relaxed">
               Submit your experience and get a polished CV that opens doors to premium yacht positions.
             </p>

            {/* Main CTA */}
            <div className="max-w-md mx-auto">
              <Link href="/apply">
                <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg">
                  Start Your Application
                  <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                                 </button>
               </Link>
             </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
                             <h3 className="text-lg font-semibold mb-2 font-heading" style={{ color: '#3e3e3e' }}>Simple & Easy Process</h3>
               <p className="text-gray-600">Intuitive form design that guides you through each step, making it quick and effortless to build your professional CV.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
                             <h3 className="text-lg font-semibold mb-2 font-heading" style={{ color: '#3e3e3e' }}>Shareable URLs</h3>
              <p className="text-gray-600">Get a professional, SEO-friendly URL for your CV that's perfect for job applications and networking.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
                             <h3 className="text-lg font-semibold mb-2 font-heading" style={{ color: '#3e3e3e' }}>Industry Standard</h3>
              <p className="text-gray-600">CVs optimized for yacht recruitment with proper formatting, terminology, and professional presentation.</p>
            </div>
          </div>

          
        </main>

                                  {/* Footer */}
         <footer className="bg-gradient-to-r from-teal-50 to-blue-50 border-t border-teal-100 relative z-10">
           <div className="max-w-6xl mx-auto px-4 py-16">
             
             <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-8">
               
               {/* Left Side - Brand & Contact */}
               <div className="text-center md:text-left">
                 <h3 className="text-2xl font-bold mb-4 font-heading" style={{ color: '#3e3e3e' }}>Pull North Yachting CV Builder</h3>
                 <p className="text-gray-700 text-base mb-4 leading-relaxed">
                   Born in Cape Town • Inspired by Passion • Built Through Experience • Growing with Authenticity
                 </p>
                 <div className="text-gray-700">
                   <p className="font-medium">36 East Pier Road, V&A Waterfront, Cape Town</p>
                 </div>
               </div>

               {/* Right Side - Social Media */}
               <div className="text-center md:text-right">
                 <h4 className="text-lg font-semibold mb-4 font-heading" style={{ color: '#3e3e3e' }}>Follow Us</h4>
                 <div className="flex justify-center md:justify-end space-x-4">
                   <a href="https://www.pullnorthyachting.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-teal-600 transition-colors duration-200">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                     </svg>
                   </a>
                                      <a href="https://www.instagram.com/pullnorthyachting/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-teal-600 transition-colors duration-200">
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                     </svg>
                   </a>
                                        <a href="https://www.facebook.com/pullnorthyachting/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-teal-600 transition-colors duration-200">
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                       </svg>
                     </a>
                     <a href="https://www.linkedin.com/in/marli-schoonraad-152201189/?originalSubdomain=za" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-teal-600 transition-colors duration-200">
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                       </svg>
                     </a>
                 </div>
               </div>

             </div>

             {/* Bottom Center - Copyright */}
            <div className="pt-8 border-t border-teal-200 text-center">
              <p className="text-gray-600 text-sm">© 2024 Pull North | Made with ❤️ by <a href="https://bucklemeshoe.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-700">bucklemeshoe</a></p>
            </div>

           </div>
         </footer>
      </div>
    </>
  )
} 
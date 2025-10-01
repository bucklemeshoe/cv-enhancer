import { useState, useEffect } from 'react'

export default function Header({ header }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPdfCapturing, setIsPdfCapturing] = useState(false)

  useEffect(() => {
    // Watch for PDF capturing class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const cvContent = document.querySelector('.cv-content');
          if (cvContent) {
            setIsPdfCapturing(cvContent.classList.contains('pdf-capturing'));
          }
        }
      });
    });

    const cvContent = document.querySelector('.cv-content');
    if (cvContent) {
      observer.observe(cvContent, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, [])

  if (!header) {
    return null;
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 py-6 sm:py-8 md:py-10 lg:py-12 mb-6 lg:mb-8 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile/Tablet: Centered Layout */}
          <div className="flex flex-col items-center text-center space-y-4 lg:hidden transition-all duration-300 ease-in-out">
          
          {/* Profile Photo at Top */}
          {header.photo && (
            <div>
              <img
                src={header.photo}
                alt={header.name}
                className="w-[135px] h-[135px] sm:w-[157px] sm:h-[157px] md:w-[157px] md:h-[157px] lg:w-[135px] lg:h-[135px] rounded-full object-cover border-4 border-gray-300 transition-all duration-300 ease-in-out"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Name and Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 transition-all duration-300 ease-in-out">
              {header.name}
            </h1>
            <p className="text-lg sm:text-xl md:text-xl lg:text-xl font-medium mb-4 transition-all duration-300 ease-in-out" style={{ color: '#5bb3b8' }}>
              {header.title}
            </p>
            
            {/* Mobile/Tablet Contact Button */}
            <div className="md:hidden mb-4 transition-all duration-300 ease-in-out">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors shadow-sm"
                style={{ backgroundColor: '#255156' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1e4147'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#255156'}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Contact
              </button>
            </div>
            
            {/* Tablet Contact Details Row */}
            <div className="hidden md:flex lg:hidden flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-600 transition-all duration-300 ease-in-out">
              {header.email && (
                <div className="flex items-center" style={{ alignItems: 'center' }}>
                  {!isPdfCapturing && (
                    <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="#5bb3b8" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span style={{ lineHeight: '16px' }}>{header.email}</span>
                </div>
              )}
              {header.phone && (
                <div className="flex items-center" style={{ alignItems: 'center' }}>
                  {!isPdfCapturing && (
                    <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="#5bb3b8" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                  <span style={{ lineHeight: '16px' }}>{header.phone}</span>
                </div>
              )}
              {header.location && (
                <div className="flex items-center" style={{ alignItems: 'center' }}>
                  {!isPdfCapturing && (
                    <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="#5bb3b8" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  <span style={{ lineHeight: '16px' }}>{header.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Side-by-Side Layout */}
        <div className="hidden lg:flex lg:items-start lg:justify-between lg:gap-8 transition-all duration-300 ease-in-out">
          
          {/* Left: Name, Title, and Contact Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {header.name}
            </h1>
            <p className="text-xl font-medium mb-4" style={{ color: '#5bb3b8' }}>
              {header.title}
            </p>
            
            {/* Desktop Contact Details Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 transition-all duration-300 ease-in-out">
              {header.email && (
                <div className="flex items-center" style={{ alignItems: 'center' }}>
                  {!isPdfCapturing && (
                    <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="#5bb3b8" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span style={{ lineHeight: '16px' }}>{header.email}</span>
                </div>
              )}
              {header.phone && (
                <div className="flex items-center" style={{ alignItems: 'center' }}>
                  {!isPdfCapturing && (
                    <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="#5bb3b8" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                  <span style={{ lineHeight: '16px' }}>{header.phone}</span>
                </div>
              )}
              {header.location && (
                <div className="flex items-center" style={{ alignItems: 'center' }}>
                  {!isPdfCapturing && (
                    <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="#5bb3b8" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  <span style={{ lineHeight: '16px' }}>{header.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Profile Photo */}
          {header.photo && (
            <div>
              <img
                src={header.photo}
                alt={header.name}
                className="w-[135px] h-[135px] rounded-full object-cover border-4 border-gray-300 transition-all duration-300 ease-in-out"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        </div>
      </header>

      {/* Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-sm md:max-w-md w-full mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Contact Information</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                {header.email && (
                  <a
                    href={`mailto:${header.email}`}
                    className="flex items-center p-3 rounded-lg transition-colors group"
                    style={{ backgroundColor: '#5bb3b820' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5bb3b830'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#5bb3b820'}
                  >
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#5bb3b8' }}>
                      <svg className="h-4 w-4 md:h-5 md:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-900" style={{ groupHover: { color: '#5bb3b8' } }}>Email</p>
                      <p className="text-xs md:text-sm text-gray-600">{header.email}</p>
                    </div>
                    <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ groupHover: { color: '#5bb3b8' } }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}

                {header.phone && (
                  <a
                    href={`tel:${header.phone}`}
                    className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 md:h-5 md:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-900 group-hover:text-green-700">Phone</p>
                      <p className="text-xs md:text-sm text-gray-600">{header.phone}</p>
                    </div>
                    <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}



                {header.location && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 md:h-5 md:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-xs md:text-sm font-medium text-gray-900">Location</p>
                      <p className="text-xs md:text-sm text-gray-600">{header.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 rounded-b-lg">
                <p className="text-xs text-gray-500 text-center">
                  Tap any contact method to get in touch immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
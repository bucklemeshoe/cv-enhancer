import { format, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'

const formatDate = (dateString) => {
  if (!dateString) return 'Present'
  try {
    return format(parseISO(dateString), 'MMM yyyy')
  } catch {
    return dateString
  }
}

export default function EducationList({ education, highestQualification }) {
  const [isPdfCapturing, setIsPdfCapturing] = useState(false);

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
  }, []);

  // Show section if we have either education entries or a highest qualification
  if ((!education || education.length === 0) && !highestQualification) return null

  // Use the provided highest qualification or fallback
  const displayQualification = highestQualification || education[0]?.qualification || "Matric"

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
          Education
        </h2>
        
        {!isPdfCapturing ? (
          <span 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: '#4A7C5920', 
              color: '#4A7C59', 
              borderColor: '#4A7C5940',
              border: '1px solid'
            }}
          >
            {displayQualification}
          </span>
        ) : (
          <span
            className="text-xs font-medium"
            style={{
              textDecoration: 'underline',
              textDecorationColor: '#4A7C59',
              textUnderlineOffset: '3px',
              textDecorationThickness: '2px',
              color: '#4A7C59'
            }}
          >
            {displayQualification}
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {education && education.length > 0 ? (
          education.map((edu, index) => (
            <div key={index}>
              <h4 className="font-medium text-gray-900">{edu.qualification}</h4>
              <p className="text-sm" style={{ color: '#5bb3b8' }}>{edu.institution}</p>
              {(edu.startDate || edu.endDate) && (
                <p className="text-sm text-gray-600">
                  {formatDate(edu.startDate)}
                  {edu.startDate && edu.endDate && ' - '}
                  {formatDate(edu.endDate)}
                </p>
              )}
              {edu.description && (
                <p className="text-sm text-gray-700 mt-1">{edu.description}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600 italic">
            Educational details to be provided
          </p>
        )}
      </div>
    </div>
  )
} 
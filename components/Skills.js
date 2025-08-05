import { useEffect, useState } from 'react';

export default function Skills({ skills }) {
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

  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">
        Skills
      </h2>
      
      {!isPdfCapturing ? (
        /* Pills view for screen display */
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
              style={{ 
                backgroundColor: '#5bb3b820', 
                color: '#5bb3b8', 
                borderColor: '#5bb3b840' 
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        /* Underlined text view for PDF export */
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-block text-sm font-medium text-gray-800"
              style={{
                textDecoration: 'underline',
                textDecorationColor: '#5bb3b8',
                textUnderlineOffset: '3px',
                textDecorationThickness: '2px'
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 
import { format, parseISO } from 'date-fns'

const formatDate = (dateString) => {
  if (!dateString) return 'Present'
  try {
    return format(parseISO(dateString), 'MMM yyyy')
  } catch {
    return dateString
  }
}

export default function PrintExperience({ experience }) {
  if (!experience || experience.length === 0) return null

  return (
    <div className="print-section">
      <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        Work Experience
      </h3>
      
      <div className="space-y-4">
        {experience.map((job, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div className="absolute left-0 top-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#5bb3b8' }}></div>
            
            {/* Content */}
            <div className="pl-4">
              <div className="flex flex-wrap items-center gap-1 mb-0.5">
                <span className="font-semibold text-gray-900 text-xs">{job.role}</span>
                <span className="text-gray-500 text-xs">•</span>
                <span className="font-medium text-xs" style={{ color: '#5bb3b8' }}>{job.vesselOrCompany}</span>
              </div>
              
              <div className="text-xs text-gray-600 mb-1">
                <span>{formatDate(job.startDate)} - {formatDate(job.endDate)}</span>
                {job.location && <span> | {job.location}</span>}
                {job.vesselDetails && <span> | {job.vesselDetails}</span>}
              </div>
              
              {job.description && (
                <p className="text-xs text-gray-700 mb-1">{job.description}</p>
              )}
              
              {/* Responsibilities/Achievements */}
              {job.bullets && job.bullets.length > 0 && (
                <ul className="text-xs text-gray-700 space-y-0.5">
                  {job.bullets.map((bullet, bulletIndex) => (
                                         <li key={bulletIndex} className="flex items-start">
                       <span className="w-1 h-1 rounded-full mt-1.5 mr-2 flex-shrink-0" style={{ backgroundColor: '#5bb3b8' }}></span>
                       <span>{bullet}</span>
                     </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
import { format, parseISO } from 'date-fns'

const formatDate = (dateString) => {
  if (!dateString) return 'Present'
  try {
    return format(parseISO(dateString), 'MMM yyyy')
  } catch {
    return dateString
  }
}

export default function ExperienceList({ experience }) {
  if (!experience || experience.length === 0) return null

  // Sort experiences by start date (newest to oldest, no date = oldest)
  const sortedExperience = [...experience].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
    return dateB - dateA // Sort newest to oldest
  })

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">
        Work Experience
      </h2>
      
      <div className="space-y-6">
        {sortedExperience.map((job, index) => (
          <div key={index} className="relative">
            
            {/* Timeline dot */}
            <div className="absolute left-0 top-2 w-2 h-2 rounded-full" style={{ backgroundColor: '#5bb3b8' }}></div>
            
            {/* Content */}
            <div className="pl-6">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{job.role}</h4>
                <span className="text-gray-500">•</span>
                <span className="font-medium" style={{ color: '#5bb3b8' }}>{job.vesselOrCompany}</span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <p className="mb-1">
                  {formatDate(job.startDate)} - {formatDate(job.endDate)} | {job.location}
                </p>
                {job.vesselDetails && (
                  <p className="font-medium">{job.vesselDetails}</p>
                )}
              </div>
              
              {job.description && (
                <p className="text-sm text-gray-700 mb-2">{job.description}</p>
              )}
              
              {/* Responsibilities/Achievements */}
              {job.bullets && job.bullets.length > 0 && (
                <ul className="text-sm text-gray-700 space-y-1">
                  {job.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>
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
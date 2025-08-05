import { format, parseISO } from 'date-fns'

const formatDate = (dateString) => {
  if (!dateString) return 'Present'
  try {
    return format(parseISO(dateString), 'yyyy')
  } catch {
    return dateString
  }
}

export default function PrintEducation({ education }) {
  if (!education || education.length === 0) return null

  return (
    <div className="print-section">
      <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        Education
      </h3>
      <div className="space-y-2">
        {education.map((edu, index) => (
          <div key={index} className="text-xs">
            <div className="font-medium text-gray-900">{edu.qualification}</div>
            <div className="text-gray-700">{edu.institution}</div>
            <div className="text-gray-600">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</div>
          </div>
        ))}
      </div>
    </div>
  )
} 
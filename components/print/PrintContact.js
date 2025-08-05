export default function PrintContact({ personalInformation }) {
  if (!personalInformation) return null

  return (
    <div className="print-section">
      <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        Personal Details
      </h3>
      <div className="space-y-2 text-xs">
        {personalInformation.nationality && (
          <div>
            <span className="font-medium">Nationality:</span>
            <span className="ml-1 text-gray-700">{personalInformation.nationality}</span>
          </div>
        )}
        {personalInformation.visa && (
          <div>
            <span className="font-medium">Visa:</span>
            <span className="ml-1 text-gray-700">{personalInformation.visa}</span>
          </div>
        )}
        {personalInformation.languages && personalInformation.languages.length > 0 && (
          <div>
            <span className="font-medium">Languages:</span>
            <span className="ml-1 text-gray-700">
              {personalInformation.languages.join(', ')}
            </span>
          </div>
        )}
        {personalInformation.health && (
          <div>
            <span className="font-medium">Health:</span>
            <span className="ml-1 text-gray-700">{personalInformation.health}</span>
          </div>
        )}
      </div>
    </div>
  )
} 
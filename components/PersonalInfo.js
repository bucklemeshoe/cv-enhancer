export default function PersonalInfo({ personalInformation }) {
  if (!personalInformation) return null

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <h2 className="text-sm font-medium uppercase tracking-wide text-gray-700 mb-4">
        Personal Information
      </h2>
      
      <div className="space-y-3 text-sm">
        {/* Location */}
        {personalInformation.location && (
          <div>
            <span className="font-medium text-gray-900">Location:</span>
            <span className="ml-2 text-gray-700">{personalInformation.location}</span>
          </div>
        )}
        
        {/* Nationality */}
        {personalInformation.nationality && (
          <div>
            <span className="font-medium text-gray-900">Nationality:</span>
            <span className="ml-2 text-gray-700">{personalInformation.nationality}</span>
          </div>
        )}
        
        {/* Languages */}
        {personalInformation.languages && personalInformation.languages.length > 0 && (
          <div>
            <span className="font-medium text-gray-900">Languages:</span>
            <div className="mt-1">
              {personalInformation.languages.map((language, index) => (
                <div key={index} className="text-gray-700 text-sm">
                  {language}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Visa */}
        {personalInformation.visa && (
          <div>
            <span className="font-medium text-gray-900">Visa Status:</span>
            <span className="ml-2 text-gray-700">{personalInformation.visa}</span>
          </div>
        )}
        
        {/* Health */}
        {personalInformation.health && (
          <div>
            <span className="font-medium text-gray-900">Health:</span>
            <span className="ml-2 text-gray-700">{personalInformation.health}</span>
          </div>
        )}
      </div>
    </div>
  )
} 
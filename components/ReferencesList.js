export default function ReferencesList({ references }) {
  if (!references || references.length === 0) return null

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">
        References
      </h2>
      
      <div className="space-y-4">
        {references.map((reference, index) => (
          <div key={index} className="text-sm">
            <h4 className="font-medium text-gray-900">{reference.name}</h4>
            <p style={{ color: '#5bb3b8' }}>{reference.roleOrRelation}</p>
            {reference.contact && (
              <p className="text-gray-600">{reference.contact}</p>
            )}
            {reference.website && (
              <p className="text-gray-600">
                <a 
                  href={reference.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: '#5bb3b8' }}
                >
                  LinkedIn Profile
                </a>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 
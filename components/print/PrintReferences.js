export default function PrintReferences({ references }) {
  if (!references || references.length === 0) return null

  return (
    <div className="print-section">
      <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        References
      </h3>
      <div className="space-y-2.5">
        {references.map((ref, index) => (
          <div key={index} className="text-xs">
            <div className="font-medium text-gray-900">{ref.name}</div>
            <div className="text-gray-700">{ref.roleOrRelation}</div>
            <div className="text-gray-600">{ref.contact}</div>
            {ref.website && (
              <div className="text-gray-600 truncate">{ref.website}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 
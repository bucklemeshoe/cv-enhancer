export default function PrintCertifications({ certifications }) {
  if (!certifications || certifications.length === 0) return null

  return (
    <div className="print-section">
      <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        Certifications
      </h3>
      <div className="space-y-3">
        {certifications.map((cert, index) => (
          <div key={index} className="text-xs">
            <div className="font-medium text-gray-900 mb-1">{cert.name}</div>
            <div className="text-gray-600">{cert.issuer} • {cert.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
} 
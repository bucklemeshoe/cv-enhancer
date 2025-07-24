export default function Certifications({ certifications }) {
  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">
        Certifications
      </h2>
      <ul className="space-y-3">
        {certifications.map((cert, index) => (
          <li key={index}>
            <div className="font-medium text-gray-900">{cert.name}</div>
            {cert.issuer && (
              <div className="text-sm text-gray-600">{cert.issuer}</div>
            )}
            {cert.date && (
              <div className="text-sm text-gray-500">{cert.date}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 
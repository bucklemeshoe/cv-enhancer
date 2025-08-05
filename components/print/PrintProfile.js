export default function PrintProfile({ profile }) {
  if (!profile) return null

  return (
    <div className="print-section">
      <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        Professional Summary
      </h3>
      <p className="text-xs text-gray-700 leading-relaxed">{profile}</p>
    </div>
  )
} 
export default function PrintSkills({ skills }) {
  if (!skills || skills.length === 0) return null

  return (
    <div className="print-section">
      <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        Skills
      </h3>
      <div className="flex flex-wrap gap-x-3 gap-y-2">
        {skills.map((skill, index) => (
          <span key={index} className="text-xs" style={{ 
            color: '#5bb3b8',
            borderBottom: '1.5px solid #5bb3b8',
            paddingBottom: '2px',
            whiteSpace: 'nowrap'
          }}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
} 
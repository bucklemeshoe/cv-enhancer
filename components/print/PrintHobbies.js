export default function PrintHobbies({ hobbies }) {
  if (!hobbies || hobbies.length === 0) return null

  return (
    <div className="print-section">
      <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        Hobbies & Interests
      </h3>
      <div className="grid grid-cols-1 gap-1">
        {hobbies.map((hobby, index) => (
          <div key={index} className="text-xs flex items-center">
            <span className="mr-2 font-bold" style={{ color: '#5bb3b8' }}>+</span>
            <span className="text-gray-700">{hobby}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 
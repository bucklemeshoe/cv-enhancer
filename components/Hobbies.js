export default function Hobbies({ hobbies }) {
  if (!hobbies || hobbies.length === 0) return null

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">
        Hobbies & Interests
      </h2>
      <ul className="space-y-2">
        {hobbies.map((hobby, index) => (
          <li key={index} className="text-sm text-gray-700">
            {hobby}
          </li>
        ))}
      </ul>
    </div>
  )
} 
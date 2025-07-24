export default function Profile({ profile }) {
  if (!profile) return null

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">
        Professional Summary
      </h2>
      <p className="text-gray-700 leading-relaxed">{profile}</p>
    </div>
  )
} 
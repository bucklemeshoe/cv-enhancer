export default function Skills({ skills }) {
  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">
        Skills
      </h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
            style={{ 
              backgroundColor: '#5bb3b820', 
              color: '#5bb3b8', 
              borderColor: '#5bb3b840' 
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
} 
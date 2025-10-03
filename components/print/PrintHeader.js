export default function PrintHeader({ header }) {
  if (!header) return null

  return (
    <div className="print-header mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{header.name}</h1>
          <p className="text-lg font-medium leading-tight" style={{ color: '#5bb3b8', marginBottom: '8px' }}>{header.title}</p>
        </div>
        {header.photo && (
          <div className="ml-4">
            <img
              src={header.photo}
              alt={header.name}
              className="w-[138px] h-[138px] rounded-full object-cover border-2 border-gray-300"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      {/* Contact info in compact horizontal layout */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 -mt-1">
        {header.email && (
          <div className="flex items-center">
            <svg className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" fill="none" stroke="#5bb3b8" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="leading-none">{header.email}</span>
          </div>
        )}
        {header.phone && (
          <div className="flex items-center">
            <svg className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" fill="none" stroke="#5bb3b8" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="leading-none">{header.phone}</span>
          </div>
        )}
        {header.location && (
          <div className="flex items-center">
            <svg className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" fill="none" stroke="#5bb3b8" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="leading-none">{header.location}</span>
          </div>
        )}

      </div>
    </div>
  )
} 
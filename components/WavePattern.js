export default function WavePattern({ position = 'bottom', color = 'white', bgColor = 'gray-50' }) {
  // SVG wave paths for different positions
  const topWavePath = "M0,320L40,298.7C80,277,160,235,240,229.3C320,224,400,256,480,250.7C560,245,640,203,720,170.7C800,139,880,117,960,122.7C1040,128,1120,160,1200,154.7C1280,149,1360,107,1400,85.3L1440,64L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"
  
  const bottomWavePath = "M0,64L40,85.3C80,107,160,149,240,154.7C320,160,400,128,480,122.7C560,117,640,139,720,170.7C800,203,880,245,960,250.7C1040,256,1120,224,1200,229.3C1280,235,1360,277,1400,298.7L1440,320L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"

  const colorClasses = {
    white: 'fill-white',
    'gray-50': 'fill-gray-50',
    'blue-50': 'fill-blue-50',
    'blue-600': 'fill-blue-600',
    'teal-bright': 'fill-white'
  }

  const bgColorClasses = {
    'gray-50': 'bg-gray-50',
    white: 'bg-white',
    'blue-50': 'bg-blue-50',
    'blue-600': 'bg-blue-600',
    'teal-bright': 'bg-blue-50'
  }

  // Custom background style for teal-bright
  const customBgStyle = bgColor === 'teal-bright' ? 
    { backgroundColor: '#5bb3b815' } : {}

  return (
    <div 
      className={`w-full overflow-hidden ${bgColorClasses[bgColor]} ${position === 'top' ? '' : ''}`}
      style={customBgStyle}
    >
      <svg
        className="w-full h-16 sm:h-20 md:h-24 lg:h-32"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={position === 'top' ? bottomWavePath : topWavePath}
          className={colorClasses[color]}
        />
      </svg>
    </div>
  )
} 
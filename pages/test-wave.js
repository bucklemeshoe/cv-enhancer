import { useState } from 'react'
import Head from 'next/head'

export default function TestWave() {
  // Top wave controls
  const [topAmplitude, setTopAmplitude] = useState(3)
  const [topFrequency, setTopFrequency] = useState(50)
  const [topWaveHeight, setTopWaveHeight] = useState(40)
  const [topPhaseShift, setTopPhaseShift] = useState(0)
  
  // Bottom wave controls
  const [bottomAmplitude, setBottomAmplitude] = useState(3)
  const [bottomFrequency, setBottomFrequency] = useState(50)
  const [bottomWaveHeight, setBottomWaveHeight] = useState(40)
  const [bottomPhaseShift, setBottomPhaseShift] = useState(0)

  // Your custom wave path (from the SVG you provided)
  const originalWavePath = "M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,192C840,181,960,139,1080,106.7C1200,75,1320,53,1380,42.7L1440,32L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
  
  // Generate SVG wave path using your custom design
  const generateWavePath = (isTop = true) => {
    if (isTop) {
      // Top wave - flip horizontally (mirror left-to-right)
      const flipped = originalWavePath.replace(/(\d+),(\d+)/g, (match, x, y) => {
        const newX = 1440 - parseInt(x) // Mirror horizontally
        return `${newX},${y}`
      })
      return flipped
    } else {
      // Bottom wave - flip vertically so it sits at bottom
      const flipped = originalWavePath.replace(/(\d+),(\d+)/g, (match, x, y) => {
        const newY = 320 - parseInt(y) // Flip vertically
        return `${x},${newY}`
      })
      return flipped.replace(/L1440,0/g, 'L1440,320').replace(/L0,0Z/g, 'L0,320Z')
    }
  }

  return (
    <>
      <Head>
        <title>Wave Pattern Test</title>
      </Head>

      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Wave Pattern Test</h1>
          
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Adjust Wave Parameters</h2>
            
            {/* Top Wave Controls */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-lg font-semibold mb-3 text-blue-600">Top Wave</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amplitude (Wave Height): {topAmplitude}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={topAmplitude}
                    onChange={(e) => setTopAmplitude(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Frequency (Wave Spacing - higher = looser): {topFrequency}px
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="5"
                    value={topFrequency}
                    onChange={(e) => setTopFrequency(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bar Height: {topWaveHeight}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={topWaveHeight}
                    onChange={(e) => setTopWaveHeight(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phase Shift (offset): {topPhaseShift}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="10"
                    value={topPhaseShift}
                    onChange={(e) => setTopPhaseShift(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Bottom Wave Controls */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-green-600">Bottom Wave</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amplitude (Wave Height): {bottomAmplitude}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={bottomAmplitude}
                    onChange={(e) => setBottomAmplitude(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Frequency (Wave Spacing - higher = looser): {bottomFrequency}px
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="5"
                    value={bottomFrequency}
                    onChange={(e) => setBottomFrequency(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bar Height: {bottomWaveHeight}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={bottomWaveHeight}
                    onChange={(e) => setBottomWaveHeight(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phase Shift (offset): {bottomPhaseShift}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="10"
                    value={bottomPhaseShift}
                    onChange={(e) => setBottomPhaseShift(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">📋 Copy these values for PDF code:</p>
              <div className="grid grid-cols-2 gap-4">
                <code className="block bg-blue-50 p-3 rounded text-xs">
                  <strong>Top Wave:</strong><br/>
                  amplitude: {topAmplitude}<br/>
                  frequency: {topFrequency}<br/>
                  waveHeight: {Math.round(topWaveHeight / 5)} mm<br/>
                  phaseShift: {topPhaseShift}°
                </code>
                <code className="block bg-green-50 p-3 rounded text-xs">
                  <strong>Bottom Wave:</strong><br/>
                  amplitude: {bottomAmplitude}<br/>
                  frequency: {bottomFrequency}<br/>
                  waveHeight: {Math.round(bottomWaveHeight / 5)} mm<br/>
                  phaseShift: {bottomPhaseShift}°
                </code>
              </div>
            </div>
          </div>
          
          {/* Preview */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Wave Preview</h2>
            
            {/* Top Wave */}
            <div className="mb-8">
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Top Wave (for top of PDF pages)
              </p>
              <svg width="100%" height="208" viewBox="0 0 1440 320" className="border border-gray-300 bg-white" preserveAspectRatio="none">
                <path
                  d={generateWavePath(true)}
                  fill="#F1F8F8"
                />
                <path
                  d="M1440,224L1380,213.3C1320,203,1200,181,1080,181.3C960,181,840,203,720,192C600,181,480,139,360,106.7C240,75,120,53,60,42.7L0,32"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* Sample Content */}
            <div className="bg-gray-50 p-8 my-4 border-2 border-dashed border-gray-300">
              <p className="text-center text-gray-500 font-medium">CV Content Area</p>
              <p className="text-center text-xs text-gray-400 mt-2">(This is where your CV content will appear)</p>
            </div>
            
            {/* Bottom Wave */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Bottom Wave (for bottom of PDF pages)
              </p>
              <svg width="100%" height="208" viewBox="0 0 1440 320" className="border border-gray-300 bg-white" preserveAspectRatio="none">
                <path
                  d={generateWavePath(false)}
                  fill="#F1F8F8"
                />
                <path
                  d="M0,96L60,106.7C120,117,240,139,360,138.7C480,139,600,117,720,128C840,139,960,181,1080,213.3C1200,245,1320,267,1380,277.3L1440,288"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong> Adjust the sliders above to get the wave pattern you like.
              Once satisfied, copy the values from the code box and I'll update the PDF generation code.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}


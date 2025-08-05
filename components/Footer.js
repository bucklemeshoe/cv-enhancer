export default function Footer({ header }) {
  if (!header) return null

  return (
    <footer style={{ backgroundColor: '#5bb3b810', margin: 0, padding: 0, boxShadow: 'none', border: 'none' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Simple Bottom Bar */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {header.name}. Pull North CV Builder
          </p>
        </div>
      </div>
    </footer>
  )
} 
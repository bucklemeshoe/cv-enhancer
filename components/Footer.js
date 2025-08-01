export default function Footer({ header }) {
  if (!header) return null

  return (
    <footer className="border-t border-gray-200" style={{ backgroundColor: '#5bb3b810' }}>
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
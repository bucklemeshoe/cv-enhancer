import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'

const user = {
  name: 'Admin User',
  email: 'admin@cvbuilder.com',
}

const navigation = [
  { name: 'Dashboard', href: '/admin', current: true },
]

const userNavigation = [
  { name: 'Sign out', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Admin() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)

  // Calculate completion percentage for a submission
  const calculateCompletionPercentage = (studentData) => {
    const fields = [
      // Personal Information (10 fields)
      { key: 'firstName', required: true },
      { key: 'lastName', required: true },
      { key: 'email', required: true },
      { key: 'phone', required: true },
      { key: 'location', required: false },
      { key: 'nationality', required: false },
      { key: 'languages', required: false, isArray: true },
      { key: 'visa', required: false, isArray: true },
      { key: 'health', required: false },
      { key: 'profilePicture', required: false, isFile: true },
      
      // Professional Information (2 fields)
      { key: 'targetRole', required: true },
      { key: 'experience', required: true, isComplexArray: true },
      
      // Skills (1 field)
      { key: 'skills', required: false },
      
      // Certifications (1 field)
      { key: 'certifications', required: false, isComplexArray: true },
      
      // Education (2 fields)
      { key: 'education', required: false, isComplexArray: true },
      { key: 'highestQualification', required: false },
      
      // Profile Summary (1 field)
      { key: 'profile', required: false },
      
      // Hobbies & Interests (1 field)
      { key: 'hobbiesAndInterests', required: false },
      
      // References (1 field)
      { key: 'references', required: false, isComplexArray: true }
    ]

    let completedFields = 0
    const totalFields = fields.length

    fields.forEach(field => {
      const value = studentData[field.key]
      let isCompleted = false

      if (field.isFile) {
        isCompleted = value !== null && value !== undefined && value !== ''
      } else if (field.isArray) {
        isCompleted = Array.isArray(value) && value.some(item => item && item.trim() !== '')
      } else if (field.isComplexArray) {
        if (field.key === 'experience') {
          isCompleted = Array.isArray(value) && value.some(exp => 
            exp.role && exp.role.trim() !== '' && exp.vesselOrCompany && exp.vesselOrCompany.trim() !== '' && exp.startDate && exp.startDate.trim() !== ''
          )
        } else if (field.key === 'certifications') {
          isCompleted = Array.isArray(value) && value.some(cert => cert.name && cert.name.trim() !== '')
        } else if (field.key === 'education') {
          isCompleted = Array.isArray(value) && value.some(edu => 
            edu.qualification && edu.qualification.trim() !== '' && edu.institution && edu.institution.trim() !== ''
          )
        } else if (field.key === 'references') {
          isCompleted = Array.isArray(value) && value.some(ref => 
            ref.name && ref.name.trim() !== '' && ref.roleOrRelation && ref.roleOrRelation.trim() !== '' && ref.contact && ref.contact.trim() !== ''
          )
        }
      } else {
        isCompleted = typeof value === 'string' && value.trim() !== ''
      }

      if (isCompleted) {
        completedFields++
      }
    })

    return Math.round((completedFields / totalFields) * 100)
  }

  // Simple password protection (in production, use proper authentication)
  const ADMIN_PASSWORD = 'cvadmin2024' // Change this to a secure password

  const statuses = {
    pending: 'text-yellow-700 bg-yellow-50 ring-yellow-600/20',
    reviewed: 'text-blue-600 bg-blue-50 ring-blue-500/10',
    published: 'text-green-700 bg-green-50 ring-green-600/20',
  }

  useEffect(() => {
    // Check for saved authentication on mount
    const savedAuth = localStorage.getItem('cvAdminAuth')
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions()
    }
  }, [isAuthenticated])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('cvAdminAuth', 'authenticated')
      setMessage('')
    } else {
      setMessage('Invalid password')
    }
  }

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
      } else {
        setMessage('Error loading submissions')
      }
    } catch (error) {
      setMessage('Error loading submissions')
    }
    setLoading(false)
  }

  const exportJSON = (submission) => {
    const dataStr = JSON.stringify(submission.studentData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `cv-data-${submission.slug}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleFileUpload = async (submissionId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('submissionId', submissionId)

    try {
      const response = await fetch('/api/admin/import-enhanced', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setMessage('Enhanced CV data imported successfully')
        loadSubmissions() // Refresh the list
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error importing enhanced data')
      }
    } catch (error) {
      setMessage('Error importing enhanced data')
    }
  }

  const publishCV = async (submissionId) => {
    // Find the submission to check completion
    const submission = submissions.find(s => s.id === submissionId)
    if (!submission) {
      setMessage('Submission not found')
      return
    }

    const completionPercentage = calculateCompletionPercentage(submission.studentData)
    
    if (completionPercentage < 85) {
      setMessage(`Cannot publish: CV is only ${completionPercentage}% complete. Need at least 85% to publish.`)
      setTimeout(() => setMessage(''), 5000)
      return
    }

    try {
      const response = await fetch('/api/admin/publish-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissionId })
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(`🎉 CV published successfully! Application was ${completionPercentage}% complete and ready for publishing. View at: /${data.slug}`)
        loadSubmissions() // Refresh the list
        // Auto-dismiss success message after 5 seconds for longer message
        setTimeout(() => setMessage(''), 5000)
      } else {
        setMessage('Error publishing CV')
      }
    } catch (error) {
      setMessage('Error publishing CV')
    }
  }

  const handleEditCV = (submission) => {
    // Navigate to the edit page
    router.push(`/admin/edit/${submission.id}`)
  }

  const handleViewCV = (submission) => {
    // Navigate to the published CV using the correct route
    if (submission.slug) {
      window.open(`/cvs/${submission.slug}`, '_blank')
    } else if (submission.publishedSlug) {
      window.open(`/cvs/${submission.publishedSlug}`, '_blank') 
    } else {
      setMessage('CV not yet published or slug not available')
    }
  }

  const handleDeleteCV = (submission) => {
    setDeleteConfirmation(submission)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation) return

    try {
      const response = await fetch('/api/admin/delete-cv', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissionId: deleteConfirmation.id })
      })

      if (response.ok) {
        setMessage(`CV for ${deleteConfirmation.studentData.firstName} ${deleteConfirmation.studentData.lastName} deleted successfully`)
        loadSubmissions() // Refresh the list
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error deleting CV')
      }
    } catch (error) {
      setMessage('Error deleting CV')
    }

    setDeleteConfirmation(null)
  }

  const cancelDelete = () => {
    setDeleteConfirmation(null)
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setPassword('')
    localStorage.removeItem('cvAdminAuth')
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - Pull North</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico?v=4" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=4" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png?v=4" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png?v=4" />
        </Head>
        
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/Pull North Stamp design.png" 
                  alt="Pull North Logo" 
                  className="h-20 w-20 rounded-full bg-white p-3 shadow-lg object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                Admin Access
              </h2>
              <p className="mt-2 text-center text-sm text-blue-200">
                Enter password to access the admin dashboard
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-white/20 bg-white/10 backdrop-blur-sm placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:z-10 sm:text-sm"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {message && (
                <div className="text-red-300 text-sm text-center bg-red-900/30 backdrop-blur-sm rounded-md p-2 border border-red-500/20">{message}</div>
              )}

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition-all duration-300 shadow-lg"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Pull North</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico?v=4" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=4" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png?v=4" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png?v=4" />
      </Head>
      
      <div className="min-h-full">
        <Disclosure as="nav" className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex shrink-0 items-center">
                                                <img
                                alt="Pull North"
                                src="/images/Pull North Stamp design.png"
                                className="block h-8 w-auto lg:hidden"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <img
                                alt="Pull North"
                                src="/images/Pull North Stamp design.png"
                                className="hidden h-8 w-auto lg:block"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                </div>
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={item.name === 'Dashboard' ? () => {} : undefined}
                      aria-current={item.current ? 'page' : undefined}
                      className={classNames(
                        item.current
                          ? 'border-teal-600 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                      )}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <button
                  type="button"
                  className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-hidden"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="size-6" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <MenuButton className="relative flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <div className="size-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white text-xs font-semibold">
                      PN
                    </div>
                  </MenuButton>

                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    {userNavigation.map((item) => (
                      <MenuItem key={item.name}>
                        <button
                          onClick={item.name === 'Sign out' ? handleSignOut : undefined}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                        >
                          {item.name}
                        </button>
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-hidden">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                  <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                </DisclosureButton>
              </div>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="button"
                  onClick={item.name === 'Dashboard' ? () => {} : undefined}
                  aria-current={item.current ? 'page' : undefined}
                  className={classNames(
                    item.current
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                    'block border-l-4 py-2 pr-4 pl-3 text-base font-medium',
                  )}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="flex items-center px-4">
                <div className="shrink-0">
                  <div className="size-10 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white text-sm font-semibold">
                    PN
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
                <button
                  type="button"
                  className="relative ml-auto shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-hidden"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="size-6" />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                {userNavigation.map((item) => (
                  <DisclosureButton
                    key={item.name}
                    as="button"
                    onClick={item.name === 'Sign out' ? handleSignOut : undefined}
                    className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    {item.name}
                  </DisclosureButton>
                ))}
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>

        <div className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Tabbed Header */}
            <div className="border-b border-gray-200 mb-8">
              <div className="sm:flex sm:items-baseline">
                <h3 className="text-base font-semibold text-gray-900">Submissions</h3>
                <div className="mt-4 sm:mt-0 sm:ml-10">
                  <nav className="-mb-px flex space-x-8">
                    {['All', 'Published'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        aria-current={activeTab === tab ? 'page' : undefined}
                        className={classNames(
                          activeTab === tab
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap',
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
          <main>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {message && (
                <div className={`mb-8 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {message}
                </div>
              )}

              {loading ? (
                <div className="text-center">Loading submissions...</div>
              ) : (() => {
                const filteredSubmissions = activeTab === 'Published' 
                  ? submissions.filter(submission => submission.status === 'published')
                  : submissions
                
                return filteredSubmissions.length === 0 ? (
                  <div className="text-center text-gray-500">
                    {activeTab === 'Published' ? 'No published submissions yet' : 'No submissions yet'}
                  </div>
                ) : (
                <div className="bg-white shadow rounded-lg">
                  <div className="p-6">
                    <ul role="list" className="divide-y divide-gray-100">
                      {filteredSubmissions.map((submission) => (
                        <li key={submission.id} className="flex items-center justify-between gap-x-6 py-5">
                          <div className="flex items-center gap-x-4 min-w-0">
                            {/* Profile Picture */}
                            <div className="flex-shrink-0">
                              {submission.studentData.profilePicture ? (
                                <img
                                  src={submission.studentData.profilePicture}
                                  alt={`${submission.studentData.firstName} ${submission.studentData.lastName}`}
                                  className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-200 ${submission.studentData.profilePicture ? 'hidden' : 'flex'}`}>
                                <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            
                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-x-3">
                                <p className="text-sm/6 font-semibold text-gray-900">
                                  {submission.studentData.firstName} {submission.studentData.lastName}
                                </p>
                                <div className="flex items-center gap-x-2">
                                  <p
                                    className={classNames(
                                      statuses[submission.status],
                                      'mt-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
                                    )}
                                  >
                                    {submission.status}
                                  </p>
                                  {submission.status === 'published' && (
                                    <button
                                      onClick={() => handleViewCV(submission)}
                                      className="mt-0.5 p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                                      title="View Published CV"
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-500">
                                <p className="whitespace-nowrap">
                                  Submitted on <time dateTime={submission.submittedAt}>{new Date(submission.submittedAt).toLocaleDateString()}</time>
                                </p>
                                <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                                  <circle r={1} cx={1} cy={1} />
                                </svg>
                                <p className="truncate">{submission.studentData.email}</p>
                              </div>
                              <div className="mt-1 flex items-center gap-x-2 text-xs text-gray-500">
                                <span>Target Role: {submission.studentData.targetRole}</span>
                                <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                                  <circle r={1} cx={1} cy={1} />
                                </svg>
                                <div className="flex items-center gap-x-1">
                                  <span>Completion:</span>
                                  <span className={`font-semibold ${
                                    calculateCompletionPercentage(submission.studentData) >= 85 ? 'text-green-600' : 
                                    calculateCompletionPercentage(submission.studentData) >= 70 ? 'text-teal-600' : 
                                    calculateCompletionPercentage(submission.studentData) >= 50 ? 'text-yellow-600' : 'text-gray-500'
                                  }`}>
                                    {calculateCompletionPercentage(submission.studentData)}%
                                  </span>
                                  {calculateCompletionPercentage(submission.studentData) >= 85 && (
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-none items-center gap-x-4">
                            <button
                              onClick={() => handleEditCV(submission)}
                              className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:block"
                            >
                              Edit CV<span className="sr-only">, {submission.studentData.firstName} {submission.studentData.lastName}</span>
                            </button>
                            <Menu as="div" className="relative flex-none">
                              <MenuButton className="relative block text-gray-500 hover:text-gray-900">
                                <span className="absolute -inset-2.5" />
                                <span className="sr-only">Open options</span>
                                <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
                              </MenuButton>
                              <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-44 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                              >
                                <MenuItem>
                                  <button
                                    onClick={() => exportJSON(submission)}
                                    className="block w-full px-3 py-1 text-left text-sm/6 text-gray-900 hover:bg-gray-50 data-focus:bg-gray-50 data-focus:outline-hidden transition-colors"
                                  >
                                    Export JSON<span className="sr-only">, {submission.studentData.firstName} {submission.studentData.lastName}</span>
                                  </button>
                                </MenuItem>
                                <MenuItem>
                                  <div>
                                    <input
                                      type="file"
                                      accept=".json"
                                      onChange={(e) => {
                                        const file = e.target.files[0]
                                        if (file) {
                                          handleFileUpload(submission.id, file)
                                        }
                                      }}
                                      className="hidden"
                                      id={`file-upload-${submission.id}`}
                                    />
                                    <label
                                      htmlFor={`file-upload-${submission.id}`}
                                      className="block w-full px-3 py-1 text-left text-sm/6 text-gray-900 cursor-pointer hover:bg-gray-50 data-focus:bg-gray-50 data-focus:outline-hidden transition-colors"
                                    >
                                      Import Enhanced<span className="sr-only">, {submission.studentData.firstName} {submission.studentData.lastName}</span>
                                    </label>
                                  </div>
                                </MenuItem>
                                <MenuItem>
                                  {(() => {
                                    const completionPercentage = calculateCompletionPercentage(submission.studentData)
                                    const canPublish = completionPercentage >= 85
                                    
                                    return (
                                      <button
                                        onClick={() => canPublish ? publishCV(submission.id) : null}
                                        disabled={!canPublish}
                                        className={`block w-full px-3 py-1 text-left text-sm/6 transition-colors ${
                                          canPublish 
                                            ? 'text-green-700 hover:bg-green-50 data-focus:bg-green-50 data-focus:outline-hidden cursor-pointer font-medium' 
                                            : 'text-gray-400 cursor-not-allowed'
                                        }`}
                                        title={canPublish ? 'Ready to Publish - 85%+ Complete!' : `CV is ${completionPercentage}% complete. Need 85% to publish.`}
                                      >
                                        {canPublish ? '✓ Publish CV' : `Publish CV (${completionPercentage}%)`}<span className="sr-only">, {submission.studentData.firstName} {submission.studentData.lastName}</span>
                                      </button>
                                    )
                                  })()}
                                </MenuItem>
                                <MenuItem>
                                  <button
                                    onClick={() => handleDeleteCV(submission)}
                                    className="block w-full px-3 py-1 text-left text-sm/6 text-red-600 hover:bg-red-50 data-focus:bg-red-50 data-focus:outline-hidden transition-colors"
                                  >
                                    Delete CV<span className="sr-only">, {submission.studentData.firstName} {submission.studentData.lastName}</span>
                                  </button>
                                </MenuItem>
                              </MenuItems>
                            </Menu>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                )
              })()}
            </div>
          </main>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                  Are you sure you want to delete?
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  This will permanently delete the CV for <strong>{deleteConfirmation.studentData.firstName} {deleteConfirmation.studentData.lastName}</strong>. This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
} 
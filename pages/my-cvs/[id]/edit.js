import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import imageCompression from 'browser-image-compression'
import { validateFormStructure, logValidationResults } from '../../../lib/form-validation'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../../contexts/AuthContext'
import { supabaseClient } from '../../../lib/supabaseClient'

const navigation = [
  { name: 'My CVs', href: '/my-cvs', current: false },
]

const userNavigation = [
  { name: 'Sign out', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function getInitials(user) {
  // Check for firstName and lastName first (new format)
  const firstName = user?.user_metadata?.firstName
  const lastName = user?.user_metadata?.lastName
  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase()
  }
  if (firstName) {
    return firstName.substring(0, 2).toUpperCase()
  }
  
  // Fallback to full name (legacy format)
  const name = user?.user_metadata?.name || user?.user_metadata?.full_name
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      // First letter of first name + first letter of last name
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    } else if (parts.length === 1) {
      // First two letters of single name
      return parts[0].substring(0, 2).toUpperCase()
    }
  }
  // Fallback to email username
  const emailUsername = user?.email?.split('@')[0] || ''
  if (emailUsername.length >= 2) {
    return emailUsername.substring(0, 2).toUpperCase()
  }
  return 'PN'
}

export default function EditCV() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    nationality: '',
    languages: [''],
    visa: [''],
    health: '',
    profilePicture: null,
    videoUrl: null,
    
    // Professional Information
    targetRole: '',
    experience: [{ 
      role: '', 
      vesselOrCompany: '', 
      startDate: '', 
      endDate: '', 
      location: '', 
      vesselDetails: '', 
      bullets: [''] 
    }],
    
    // Skills & Certifications
    skills: '',
    certifications: [{ name: '', issuer: '', date: '' }],
    
    // Education
    education: [{ qualification: '', institution: '', startDate: '', endDate: '' }],
    highestQualification: '',
    
    // Personal Profile
    profile: '',
    hobbiesAndInterests: '',
    
    // References
    references: [{ name: '', roleOrRelation: '', contact: '', website: '' }],
    
    // Additional Info
    availability: '',
    salaryExpectation: '',
    additionalNotes: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalFormData, setOriginalFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPublished, setIsPublished] = useState(false)
  const [imageCompressing, setImageCompressing] = useState(false)
  const [error, setError] = useState(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Load submission data when authenticated and ID is available
  useEffect(() => {
    if (id && user && !authLoading) {
      loadSubmissionData()
    }
  }, [id, user, authLoading])

  // Handle browser navigation (back button, refresh, close tab)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    const handleRouteChange = (url) => {
      if (hasUnsavedChanges && !url.includes('/my-cvs')) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to leave without saving?'
        )
        if (!confirmed) {
          router.events.emit('routeChangeError')
          throw 'Route change aborted'
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [hasUnsavedChanges, router])

  const handleBackToMyCVs = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave without saving?'
      )
      if (!confirmed) {
        return
      }
    }
    router.push('/my-cvs')
  }

  const handleSignOut = async () => {
    try {
      const { signOut } = await import('../../../lib/auth')
      await signOut()
      router.push('/')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  const loadSubmissionData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get auth token
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        setError('Not authenticated')
        setLoading(false)
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/my-cvs/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (response.ok) {
        const { submission } = await response.json()
        const data = submission.studentData || {}
        
        // Check if CV is published
        setIsPublished(submission.status === 'published')
        
        // Verify ownership (should be handled by API, but double-check)
        if (submission.user_id && user && submission.user_id !== user.id) {
          setError('You do not have permission to edit this CV')
          setLoading(false)
          router.push('/my-cvs')
          return
        }
        
        const loadedFormData = {
          // Personal Information
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          nationality: data.nationality || '',
          languages: Array.isArray(data.languages) ? data.languages : (data.languages ? [data.languages] : ['']),
          visa: Array.isArray(data.visa) ? data.visa : (data.visa ? [data.visa] : ['']),
          health: data.health || '',
          profilePicture: data.profilePicture || null, // Load existing profile picture
          
          // Professional Information
          targetRole: data.targetRole || '',
          experience: Array.isArray(data.experience) && data.experience.length > 0 
            ? data.experience.map(exp => ({
                ...exp,
                bullets: Array.isArray(exp.bullets) ? exp.bullets : (exp.bullets ? [exp.bullets] : [''])
              }))
            : [{ role: '', vesselOrCompany: '', startDate: '', endDate: '', location: '', vesselDetails: '', bullets: [''] }],
          
          // Skills & Certifications
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
          certifications: Array.isArray(data.certifications) && data.certifications.length > 0 
            ? data.certifications 
            : [{ name: '', issuer: '', date: '' }],
          
          // Education
          education: Array.isArray(data.education) && data.education.length > 0 
            ? data.education 
            : [{ qualification: '', institution: '', startDate: '', endDate: '' }],
          highestQualification: data.highestQualification || '',
          
          // Personal Profile
          profile: data.profile || '',
          hobbiesAndInterests: Array.isArray(data.hobbiesAndInterests) 
            ? data.hobbiesAndInterests.join(', ') 
            : (data.hobbiesAndInterests || ''),
          
          // References
          references: Array.isArray(data.references) && data.references.length > 0 
            ? data.references 
            : [{ name: '', roleOrRelation: '', contact: '', website: '' }],
          
          // Additional Info
          availability: data.availability || '',
          salaryExpectation: data.salaryExpectation || '',
          additionalNotes: data.additionalNotes || '',
          
          // Video URL
          videoUrl: data.videoUrl || null
        }
        
        // Validate form structure in development
        if (process.env.NODE_ENV === 'development') {
          const validation = validateFormStructure(loadedFormData, `Admin Edit Form (ID: ${id})`)
          logValidationResults(validation)
        }
        
        setFormData(loadedFormData)
        setOriginalFormData(JSON.stringify(data)) // Store original data for comparison
        setLoading(false)
      } else {
        setSubmitMessage('Error loading CV data')
        setLoading(false)
      }
    } catch (error) {
      setSubmitMessage('Error loading CV data')
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Handle skills limit validation
    if (name === 'skills') {
      const skillsArray = value.split(',').map(s => s.trim()).filter(s => s)
      if (skillsArray.length > 15) {
        // Don't update if more than 15 skills
        return
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setHasUnsavedChanges(true)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)')
        return
      }
      
      try {
        setImageCompressing(true)
        
        // Compression options
        const options = {
          maxSizeMB: 0.5,          // Compress to max 500KB
          maxWidthOrHeight: 800,   // Resize to max 800px on longest side
          useWebWorker: true,      // Use web worker for non-blocking compression
          quality: 0.8,            // Good quality while reducing size
          fileType: 'image/jpeg'   // Convert to JPEG for better compression
        }
        
        console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB')
        
        // Compress the image
        const compressedFile = await imageCompression(file, options)
        
        console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB')
        console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%')
        
        // Convert the compressed file to a base64 data URL for immediate preview and reliable submission
        const base64DataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(compressedFile)
        })
        
        setFormData(prev => ({
          ...prev,
          profilePicture: base64DataUrl
        }))
        setHasUnsavedChanges(true)
        
      } catch (error) {
        console.error('Image compression failed:', error)
        alert('Failed to compress image. Please try a different image.')
      } finally {
        setImageCompressing(false)
      }
    }
  }

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
    setHasUnsavedChanges(true)
  }

  const handleObjectArrayChange = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    }))
    setHasUnsavedChanges(true)
  }

  const addArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }))
    setHasUnsavedChanges(true)
  }

  const addObjectArrayItem = (field, defaultObject) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultObject]
    }))
    setHasUnsavedChanges(true)
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
    setHasUnsavedChanges(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')
    
    try {
      // Get auth token
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        setSubmitMessage('Not authenticated. Please sign in again.')
        setIsSubmitting(false)
        router.push('/auth/login')
        return
      }

      // Always send JSON. profilePicture is already a base64 string if present
      const response = await fetch(`/api/my-cvs/${id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          studentData: formData
        })
      })
      
      if (response.ok) {
        setSubmitMessage('CV updated successfully!')
        setHasUnsavedChanges(false) // Reset unsaved changes flag
        // Redirect back to My CVs after 2 seconds
        setTimeout(() => {
          router.push('/my-cvs')
        }, 2000)
      } else {
        // Get specific error message from server
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Update failed:', response.status, errorData)
        setSubmitMessage(`Update failed: ${errorData.message || 'Please try again.'}`)
        if (response.status === 403) {
          router.push('/my-cvs')
        }
      }
    } catch (error) {
      console.error('Network error:', error)
      setSubmitMessage(`Network error: ${error.message || 'Please check your connection and try again.'}`)
    }
    
    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading CV data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Edit CV - {formData.firstName} {formData.lastName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico?v=4" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=4" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png?v=4" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png?v=4" />
        <meta name="description" content="Submit your information for professional CV enhancement" />
        <style jsx>{`
          /* Enhanced date picker styling for mobile */
          input[type="date"] {
            position: relative;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          
          input[type="date"]::-webkit-calendar-picker-indicator {
            position: absolute;
            right: 8px;
            color: #6B7280;
            cursor: pointer;
            font-size: 16px;
          }
          
          input[type="date"]::-webkit-inner-spin-button,
          input[type="date"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          /* Ensure proper mobile sizing */
          @media (max-width: 640px) {
            input[type="date"] {
              font-size: 16px; /* Prevents zoom on iOS */
              min-height: 44px; /* iOS minimum touch target */
            }
          }
        `}</style>
      </Head>
      
      <div className="min-h-full bg-white">
            
            {authLoading || loading ? (
              <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-4 text-lg text-gray-600">Loading CV data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg text-red-600">{error}</p>
                  <Link href="/my-cvs" className="mt-4 inline-block text-teal-600 hover:text-teal-700">
                    Back to My CVs
                  </Link>
                </div>
              </div>
            ) : !user ? (
              <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg text-gray-600">Redirecting to login...</p>
                </div>
              </div>
            ) : (
                <>
                  {/* Header Navigation */}
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
                                  onClick={() => router.push(item.href)}
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
                                  {getInitials(user)}
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
                              onClick={() => router.push(item.href)}
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
                                {getInitials(user)}
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium text-gray-800">
                                {user?.user_metadata?.firstName && user?.user_metadata?.lastName
                                  ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
                                  : user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                              </div>
                              <div className="text-sm font-medium text-gray-500">{user?.email || ''}</div>
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
                      <div className="bg-white">

                  {/* Breadcrumb Navigation */}
            <div className="mb-8">
              <nav aria-label="Back" className="sm:hidden">
                <button 
                  onClick={handleBackToMyCVs}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeftIcon aria-hidden="true" className="mr-1 -ml-1 size-5 shrink-0 text-gray-400" />
                  Back
                </button>
              </nav>
              <nav aria-label="Breadcrumb" className="hidden sm:flex">
                <ol role="list" className="flex items-center space-x-4">
                  <li>
                    <div className="flex">
                      <Link 
                        href="/my-cvs"
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        My CVs
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                      <span aria-current="page" className="ml-4 text-sm font-medium text-gray-500">
                        Edit CV
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>

            {/* Page Header */}
            <div className="mb-12 md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                  Edit CV - <span className="italic">{formData.firstName} {formData.lastName}</span>
                </h1>
                <p className="mt-2 text-lg text-gray-600 max-w-3xl leading-relaxed">
                  Make changes to this CV application. All modifications will be saved to the submission record.
                </p>
              </div>
              <div className="mt-4 flex shrink-0 items-center space-x-3 md:mt-0 md:ml-4">
                {hasUnsavedChanges && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="h-4 w-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-yellow-600 font-medium">Unsaved changes</span>
                  </div>
                )}
                
                <Link
                  href="/my-cvs"
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                >
                  Back to My CVs
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleSubmit(e)
                  }}
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: isSubmitting ? '#6b7280' : '#14b8a6'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = '#0d9488'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = '#14b8a6'
                    }
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-gray-200 mb-8"></div>

            {submitMessage && (
              <div className={`mb-8 p-4 rounded-lg border ${submitMessage.includes('Error') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                {submitMessage}
              </div>
            )}


            <form onSubmit={handleSubmit}>
              <div className="space-y-12 sm:space-y-16">
                
                {/* Personal Information */}
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900">Personal Information</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                    Basic contact details and personal information for your CV.
                  </p>

                  <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
                    
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        First name
                        {(isPublished || (user && ((user.user_metadata?.firstName && user.user_metadata?.lastName) || user.user_metadata?.name || user.user_metadata?.full_name))) && (
                          <span className="text-xs text-amber-600 block mt-1">
                            {isPublished ? '🔒 Cannot edit after publication' : '🔒 Set from your account'}
                          </span>
                        )}
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          disabled={isPublished || (user && ((user.user_metadata?.firstName && user.user_metadata?.lastName) || user.user_metadata?.name || user.user_metadata?.full_name))}
                          className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6 ${
                            isPublished || (user && ((user.user_metadata?.firstName && user.user_metadata?.lastName) || user.user_metadata?.name || user.user_metadata?.full_name))
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : ''
                          }`}
                        />
                        {user && ((user.user_metadata?.firstName && user.user_metadata?.lastName) || user.user_metadata?.name || user.user_metadata?.full_name) && (
                          <p className="mt-1 text-sm text-amber-600">
                            Your name is set from your account and cannot be changed here.
                          </p>
                        )}
                        {isPublished && (!user || !((user.user_metadata?.firstName && user.user_metadata?.lastName) || user.user_metadata?.name || user.user_metadata?.full_name)) && (
                          <p className="mt-1 text-sm text-amber-600">
                            The first name cannot be changed after the CV has been published because it's part of the public URL.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Last name
                        {(isPublished || (user && ((user.user_metadata?.firstName && user.user_metadata?.lastName) || user.user_metadata?.name || user.user_metadata?.full_name))) && (
                          <span className="text-xs text-amber-600 block mt-1">
                            {isPublished ? '🔒 Cannot edit after publication' : '🔒 Set from your account'}
                          </span>
                        )}
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          disabled={isPublished || (user && ((user.user_metadata?.firstName && user.user_metadata?.lastName) || user.user_metadata?.name || user.user_metadata?.full_name))}
                          className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6 ${
                            isPublished || (user && ((user.user_metadata?.firstName && user.user_metadata?.lastName) || user.user_metadata?.name || user.user_metadata?.full_name))
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                              : ''
                          }`}
                        />
                        {user && ((user.user_metadata?.firstName && user.user_metadata?.lastName) || user.user_metadata?.name || user.user_metadata?.full_name) && (
                          <p className="mt-1 text-sm text-amber-600">
                            Your name is set from your account and cannot be changed here.
                          </p>
                        )}
                        {isPublished && (!user || !((user.user_metadata?.firstName && user.user_metadata?.lastName) || user.user_metadata?.name || user.user_metadata?.full_name)) && (
                          <p className="mt-1 text-sm text-amber-600">
                            The last name cannot be changed after the CV has been published because it's part of the public URL.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Email address
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-md sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Phone
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-teal-600 sm:max-w-md">
                          <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm rounded-l-md">+</span>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="27 82 123 4567"
                            className="block flex-1 border-0 bg-transparent py-1.5 pr-3 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none rounded-r-md sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Current location
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          type="text"
                          name="location"
                          id="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="City, Country"
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-md sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="nationality" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Nationality
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          type="text"
                          name="nationality"
                          id="nationality"
                          value={formData.nationality}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Languages
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="space-y-3">
                          {formData.languages.map((language, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={language}
                                onChange={(e) => handleArrayChange('languages', index, e.target.value)}
                                placeholder="e.g., English (Native), Spanish (Fluent)"
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                              />
                              {formData.languages.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('languages', index)}
                                  className="rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-400"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addArrayItem('languages')}
                            className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
                            style={{ backgroundColor: '#14b8a6' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9488'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#14b8a6'}
                          >
                            Add Language
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Visa Status
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="space-y-3">
                          {formData.visa.map((visaItem, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={visaItem}
                                onChange={(e) => handleArrayChange('visa', index, e.target.value)}
                                placeholder="e.g., EU Passport, US Green Card, B1/B2 Visa"
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                              />
                              {formData.visa.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('visa', index)}
                                  className="rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-400"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addArrayItem('visa')}
                            className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
                            style={{ backgroundColor: '#14b8a6' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9488'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#14b8a6'}
                          >
                            Add Visa Status
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="health" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Health Status
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <textarea
                          name="health"
                          id="health"
                          rows={3}
                          value={formData.health}
                          onChange={handleInputChange}
                          placeholder="e.g., Excellent health, ENG1 Medical Certificate valid until 2025, No medical restrictions"
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-2xl sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="profilePicture" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Profile Photo
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="flex items-center gap-x-6">
                          {formData.profilePicture && 
                           ((typeof formData.profilePicture === 'string' && formData.profilePicture.trim() !== '') || 
                            (typeof formData.profilePicture === 'object' && formData.profilePicture instanceof File)) ? (
                            <img
                              src={typeof formData.profilePicture === 'string' ? formData.profilePicture : ''}
                              alt="Profile preview"
                              className="size-24 rounded-full object-cover ring-2 ring-gray-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {!(formData.profilePicture && 
                             ((typeof formData.profilePicture === 'string' && formData.profilePicture.trim() !== '') || 
                              (typeof formData.profilePicture === 'object' && formData.profilePicture instanceof File))) && (
                            <div className="size-24 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-300">
                              <svg className="size-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor="profilePicture"
                              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
                            >
                              {formData.profilePicture ? 'Change Photo' : 'Upload Photo'}
                            </label>
                            <input
                              id="profilePicture"
                              name="profilePicture"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="sr-only"
                              disabled={imageCompressing}
                            />
                            {imageCompressing && (
                              <div className="flex items-center space-x-2 text-sm text-blue-600">
                                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                <span>Compressing image...</span>
                              </div>
                            )}
                            {formData.profilePicture && (
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, profilePicture: null }))}
                                className="text-sm text-rose-500 hover:text-rose-400"
                              >
                                Remove Photo
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          JPG, PNG or WebP. Maximum file size 5MB.
                        </p>
                      </div>
                    </div>

                    {/* Video URL Field */}
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="videoUrl" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Video Introduction
                        <span className="text-gray-500 font-normal"> (Optional)</span>
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="flex items-center gap-x-4">
                          <div className="flex-1 relative">
                            <input
                              type="url"
                              name="videoUrl"
                              id="videoUrl"
                              value={formData.videoUrl || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                              placeholder="Paste your URL here..."
                              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {formData.videoUrl && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {formData.videoUrl && (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, videoUrl: null }))}
                              className="rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-400"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          Add a YouTube Short, TikTok, or Instagram Reel to showcase personality and skills.
                        </p>
                        {formData.videoUrl && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2 text-sm text-blue-700">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                              <span>Profile picture will have a special gradient border to indicate the video!</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badge Toggle Section (Admin Only) */}
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900">Professional Information</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                    Your work experience and career details in the maritime industry.
                  </p>

                  <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
                    
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="targetRole" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Target Role
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          type="text"
                          name="targetRole"
                          id="targetRole"
                          value={formData.targetRole}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Deckhand, Stewardess, Chef"
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-md sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Work Experience
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="space-y-6">
                          {formData.experience.map((exp, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <input
                                  type="text"
                                  value={exp.role}
                                  onChange={(e) => handleObjectArrayChange('experience', index, 'role', e.target.value)}
                                  placeholder="Role/Position"
                                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                />
                                <input
                                  type="text"
                                  value={exp.vesselOrCompany}
                                  onChange={(e) => handleObjectArrayChange('experience', index, 'vesselOrCompany', e.target.value)}
                                  placeholder="Vessel/Company Name"
                                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                />
                                <input
                                  type="date"
                                  value={exp.startDate}
                                  onChange={(e) => handleObjectArrayChange('experience', index, 'startDate', e.target.value)}
                                  min="1950-01-01"
                                  max={new Date().toISOString().split('T')[0]}
                                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 appearance-none"
                                  style={{ colorScheme: 'light' }}
                                />
                                <input
                                  type="date"
                                  value={exp.endDate}
                                  onChange={(e) => handleObjectArrayChange('experience', index, 'endDate', e.target.value)}
                                  min="1950-01-01"
                                  max={new Date().toISOString().split('T')[0]}
                                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 appearance-none"
                                  style={{ colorScheme: 'light' }}
                                />
                                <input
                                  type="text"
                                  value={exp.location}
                                  onChange={(e) => handleObjectArrayChange('experience', index, 'location', e.target.value)}
                                  placeholder="Location"
                                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                />
                                <input
                                  type="text"
                                  value={exp.vesselDetails}
                                  onChange={(e) => handleObjectArrayChange('experience', index, 'vesselDetails', e.target.value)}
                                  placeholder="Vessel Details (e.g., 45m Motor Yacht)"
                                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                              <div className="relative">
                                <textarea
                                  value={exp.bullets.join('\n')}
                                  onChange={(e) => handleObjectArrayChange('experience', index, 'bullets', e.target.value.split('\n'))}
                                  placeholder="Key responsibilities and achievements (one per line)"
                                  rows="3"
                                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                />
                              </div>
                              {formData.experience.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('experience', index)}
                                  className="mt-2 rounded-md bg-rose-500 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-rose-400"
                                >
                                  Remove Experience
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addObjectArrayItem('experience', { role: '', vesselOrCompany: '', startDate: '', endDate: '', location: '', vesselDetails: '', bullets: [''] })}
                            className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
                            style={{ backgroundColor: '#14b8a6' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9488'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#14b8a6'}
                          >
                            Add Experience
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900">Skills</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                    List your professional skills relevant to the maritime industry.
                  </p>

                  <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
                    
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="skills" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Skills <span className="text-sm text-gray-500">(comma-separated, max 15)</span>
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <textarea
                          name="skills"
                          id="skills"
                          rows={3}
                          value={formData.skills}
                          onChange={handleInputChange}
                          placeholder="e.g., Communication, Organization, Washdowns, Deck Maintenance, Time Management, Problem Solving, Guest Services"
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-2xl sm:text-sm sm:leading-6"
                        />
                        <div className="mt-3 flex justify-between items-center">
                          <p className="text-sm leading-6 text-gray-600">
                            Separate each skill with a comma. Example: Communication, Leadership, Safety Protocols
                          </p>
                          <span className="text-sm font-medium text-gray-500">
                            {formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s).length : 0}/15 skills
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900">Certifications</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                    Professional certifications and maritime qualifications.
                  </p>

                  <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
                    
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Certifications
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="space-y-6">
                          {formData.certifications.map((cert, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Certification Name</label>
                                  <input
                                    type="text"
                                    value={cert.name}
                                    onChange={(e) => handleObjectArrayChange('certifications', index, 'name', e.target.value)}
                                    placeholder="e.g., STCW Basic Safety Training"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Issuing Authority</label>
                                  <input
                                    type="text"
                                    value={cert.issuer}
                                    onChange={(e) => handleObjectArrayChange('certifications', index, 'issuer', e.target.value)}
                                    placeholder="e.g., MCA Approved Training Center"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Date/Validity</label>
                                  <input
                                    type="text"
                                    value={cert.date}
                                    onChange={(e) => handleObjectArrayChange('certifications', index, 'date', e.target.value)}
                                    placeholder="e.g., 2024 or Valid until 2025"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                              </div>
                              {formData.certifications.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('certifications', index)}
                                  className="mt-2 rounded-md bg-rose-500 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-rose-400"
                                >
                                  Remove Certification
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addObjectArrayItem('certifications', { name: '', issuer: '', date: '' })}
                            className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
                            style={{ backgroundColor: '#14b8a6' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9488'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#14b8a6'}
                          >
                            Add Certification
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Education */}
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900">Education</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                    Educational background and academic qualifications.
                  </p>

                  <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
                    
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Highest Qualification
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="space-y-3">
                                                          {['High School Certificate', 'Higher Certificate', 'Diploma', 'Degree'].map((option) => (
                            <div key={option} className="flex items-center">
                              <input
                                id={`qualification-${option.toLowerCase().replace(/\s+/g, '-')}`}
                                name="highestQualification"
                                type="radio"
                                value={option}
                                checked={formData.highestQualification === option}
                                onChange={handleInputChange}
                                className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-600 focus:ring-2 focus:ring-offset-0"
                              />
                              <label htmlFor={`qualification-${option.toLowerCase().replace(/\s+/g, '-')}`} className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          This will appear as a badge next to Education on your CV
                        </p>
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Educational Details
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="space-y-6">
                          {formData.education.map((edu, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Qualification</label>
                                  <input
                                    type="text"
                                    value={edu.qualification}
                                    onChange={(e) => handleObjectArrayChange('education', index, 'qualification', e.target.value)}
                                                                                placeholder="e.g., High School Certificate, Bachelor's Degree"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Institution</label>
                                  <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) => handleObjectArrayChange('education', index, 'institution', e.target.value)}
                                    placeholder="e.g., University Name, School Name"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                                    <input
                                      type="date"
                                      value={edu.startDate}
                                      onChange={(e) => handleObjectArrayChange('education', index, 'startDate', e.target.value)}
                                      min="1950-01-01"
                                      max={new Date().toISOString().split('T')[0]}
                                      className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 appearance-none"
                                      style={{ colorScheme: 'light' }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                                    <input
                                      type="date"
                                      value={edu.endDate}
                                      onChange={(e) => handleObjectArrayChange('education', index, 'endDate', e.target.value)}
                                      min="1950-01-01"
                                      max={new Date().toISOString().split('T')[0]}
                                      className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 appearance-none"
                                      style={{ colorScheme: 'light' }}
                                    />
                                  </div>
                                </div>
                              </div>
                              {formData.education.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('education', index)}
                                  className="mt-2 rounded-md bg-rose-500 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-rose-400"
                                >
                                  Remove Education
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addObjectArrayItem('education', { qualification: '', institution: '', startDate: '', endDate: '' })}
                            className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
                            style={{ backgroundColor: '#14b8a6' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9488'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#14b8a6'}
                          >
                            Add Education
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Profile Summary */}
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900">Profile Summary</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                    A brief professional summary highlighting your experience and career goals.
                  </p>

                  <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
                    
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="profile" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Profile Summary
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="relative">
                          <textarea
                            name="profile"
                            id="profile"
                            rows={4}
                            value={formData.profile}
                            onChange={handleInputChange}
                            maxLength="800"
                            placeholder="Write a brief professional summary about yourself, your experience, and career goals..."
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-2xl sm:text-sm sm:leading-6"
                          />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {formData.profile.length}/800 characters
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Hobbies & Interests */}
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900">Hobbies & Interests</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                    Personal interests and activities that showcase your personality.
                  </p>

                  <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
                    
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="hobbiesAndInterests" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Hobbies & Interests <span className="text-sm text-gray-500">(comma-separated)</span>
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="relative">
                          <textarea
                            name="hobbiesAndInterests"
                            id="hobbiesAndInterests"
                            rows={2}
                            value={formData.hobbiesAndInterests}
                            onChange={handleInputChange}
                            placeholder="e.g., Running & Swimming, Ocean & Adventure Sports, Photography, Cultural Exchange, Water Sports"
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-2xl sm:text-sm sm:leading-6"
                          />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          Separate each interest with a comma. Example: Photography, Sailing, Fitness
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* References */}
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900">References</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                    Professional references who can speak to your work experience and character.
                  </p>

                  <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
                    
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        References
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="space-y-6">
                          {formData.references.map((ref, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                                  <input
                                    type="text"
                                    value={ref.name}
                                    onChange={(e) => handleObjectArrayChange('references', index, 'name', e.target.value)}
                                    placeholder="e.g., Captain John Smith"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Role/Relationship</label>
                                  <input
                                    type="text"
                                    value={ref.roleOrRelation}
                                    onChange={(e) => handleObjectArrayChange('references', index, 'roleOrRelation', e.target.value)}
                                    placeholder="e.g., Captain, M/Y Princess Skye"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
                                  <input
                                    type="tel"
                                    value={ref.contact}
                                    onChange={(e) => handleObjectArrayChange('references', index, 'contact', e.target.value)}
                                    placeholder="e.g., +27 82 123 4567 or email@example.com"
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                                  />
                                </div>

                              </div>
                              {formData.references.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('references', index)}
                                  className="mt-2 rounded-md bg-rose-500 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-rose-400"
                                >
                                  Remove Reference
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addObjectArrayItem('references', { name: '', roleOrRelation: '', contact: '' })}
                            disabled={formData.references.length >= 3}
                            className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
                              formData.references.length >= 3 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'hover:bg-teal-700'
                            }`}
                            style={{ 
                              backgroundColor: formData.references.length >= 3 ? '#9ca3af' : '#14b8a6'
                            }}
                            onMouseEnter={(e) => {
                              if (formData.references.length < 3) {
                                e.target.style.backgroundColor = '#0d9488'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (formData.references.length < 3) {
                                e.target.style.backgroundColor = '#14b8a6'
                              }
                            }}
                          >
                            Add Reference {formData.references.length >= 3 ? '(Max 3)' : ''}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button
                    type="button" 
                    onClick={handleBackToMyCVs}
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    Back to My CVs
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ 
                      backgroundColor: isSubmitting ? '#6b7280' : '#14b8a6',
                      focusVisibleOutlineColor: '#14b8a6'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) e.target.style.backgroundColor = '#0d9488'
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) e.target.style.backgroundColor = '#14b8a6'
                    }}
                  >
                    {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
                      </div>
                    </div>
                  </div>
                    </div>
                </>
              )}
      </div>
    </>
  )
} 
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

const user = {
  name: 'Admin User',
  email: 'admin@cvbuilder.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

const navigation = [
  { name: 'Dashboard', href: '/admin', current: false },
]

const userNavigation = [
  { name: 'Sign out', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function EditCV() {
  const router = useRouter()
  const { id } = router.query
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
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
  const [enhancingFields, setEnhancingFields] = useState({})
  const [enhancingAll, setEnhancingAll] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressSteps, setProgressSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalFormData, setOriginalFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPublished, setIsPublished] = useState(false)

  // Simple password protection (in production, use proper authentication)
  const ADMIN_PASSWORD = 'cvadmin2024' // Change this to a secure password

  // Check authentication on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('cvAdminAuth')
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  // Load submission data when authenticated and ID is available
  useEffect(() => {
    if (id && isAuthenticated) {
      loadSubmissionData()
    }
  }, [id, isAuthenticated])

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
      if (hasUnsavedChanges && !url.includes('/admin')) {
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

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('cvAdminAuth', 'authenticated')
    }
  }

  const handleBackToAdmin = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave without saving?'
      )
      if (!confirmed) {
        return
      }
    }
    router.push('/admin')
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setPassword('')
    localStorage.removeItem('cvAdminAuth')
  }

  const enhanceField = async (fieldType, fieldKey = null, experienceIndex = null) => {
    try {
      // Set loading state
      const loadingKey = experienceIndex !== null ? `${fieldType}-${experienceIndex}` : fieldType
      setEnhancingFields(prev => ({ ...prev, [loadingKey]: true }))

      let content = ''
      let context = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        targetRole: formData.targetRole
      }

      // Get content based on field type
      switch (fieldType) {
        case 'profile':
          content = formData.profile
          break
        case 'hobbies':
          content = formData.hobbiesAndInterests
          break
        case 'experience':
          if (experienceIndex !== null && formData.experience[experienceIndex]) {
            content = formData.experience[experienceIndex].bullets.join('\n')
            context.role = formData.experience[experienceIndex].role
            context.vessel = formData.experience[experienceIndex].vesselOrCompany
          }
          break
      }

      if (!content.trim()) {
        setSubmitMessage('Please add some content before enhancing')
        return
      }

      const response = await fetch('/api/admin/ai-enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: fieldType,
          content: content.trim(),
          context
        })
      })

      if (!response.ok) {
        throw new Error('Enhancement failed')
      }

      const result = await response.json()

      // Update the form data with enhanced content
      if (fieldType === 'profile') {
        setFormData(prev => ({ ...prev, profile: result.enhancedContent }))
      } else if (fieldType === 'hobbies') {
        setFormData(prev => ({ ...prev, hobbiesAndInterests: result.enhancedContent }))
      } else if (fieldType === 'experience' && experienceIndex !== null) {
        const updatedExperience = [...formData.experience]
        updatedExperience[experienceIndex].bullets = result.enhancedContent.split('\n').filter(bullet => bullet.trim())
        setFormData(prev => ({ ...prev, experience: updatedExperience }))
      }

      setHasUnsavedChanges(true) // Mark as having unsaved changes
      setSubmitMessage(`${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} enhanced successfully!`)
      setTimeout(() => setSubmitMessage(''), 3000)

    } catch (error) {
      console.error('Enhancement error:', error)
      setSubmitMessage('Enhancement failed. Please try again.')
      setTimeout(() => setSubmitMessage(''), 3000)
    } finally {
      const loadingKey = experienceIndex !== null ? `${fieldType}-${experienceIndex}` : fieldType
      setEnhancingFields(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const enhanceAllFields = async () => {
    setEnhancingAll(true)
    setShowProgressModal(true)
    setCurrentStep(0)
    
    // Build list of steps based on available content
    const steps = []
    if (formData.profile.trim()) {
      steps.push({ field: 'profile', title: 'Profile Summary', status: 'pending' })
    }
    if (formData.hobbiesAndInterests.trim()) {
      steps.push({ field: 'hobbies', title: 'Hobbies & Interests', status: 'pending' })
    }
    // Add experience steps
    formData.experience.forEach((exp, index) => {
      if (exp.bullets.some(bullet => bullet.trim())) {
        steps.push({ 
          field: 'experience', 
          index,
          title: `Experience: ${exp.role || 'Position ' + (index + 1)}`, 
          status: 'pending' 
        })
      }
    })
    
    setProgressSteps(steps)
    
    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        setCurrentStep(i)
        
        // Update step to processing
        setProgressSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'processing' } : s
        ))
        
        // Enhance the field
        if (step.field === 'experience') {
          await enhanceFieldSilent('experience', null, step.index)
        } else {
          await enhanceFieldSilent(step.field)
        }
        
        // Update step to completed
        setProgressSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'completed' } : s
        ))
        
        // Small delay between requests
        if (i < steps.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800))
        }
      }
      
      // Close modal and show success toast
      setTimeout(() => {
        setShowProgressModal(false)
        setSubmitMessage('All fields enhanced successfully! ✨')
        setTimeout(() => setSubmitMessage(''), 4000)
      }, 1000)
      
    } catch (error) {
      console.error('Bulk enhancement error:', error)
      setShowProgressModal(false)
      setSubmitMessage('Some enhancements failed. Please try again.')
      setTimeout(() => setSubmitMessage(''), 3000)
    } finally {
      setEnhancingAll(false)
    }
  }

  // Silent version of enhanceField that doesn't show individual toasts
  const enhanceFieldSilent = async (fieldType, fieldKey = null, experienceIndex = null) => {
    try {
      let content = ''
      let context = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        targetRole: formData.targetRole
      }

      // Get content based on field type
      switch (fieldType) {
        case 'profile':
          content = formData.profile
          break
        case 'hobbies':
          content = formData.hobbiesAndInterests
          break
        case 'experience':
          if (experienceIndex !== null && formData.experience[experienceIndex]) {
            content = formData.experience[experienceIndex].bullets.join('\n')
            context.role = formData.experience[experienceIndex].role
            context.vessel = formData.experience[experienceIndex].vesselOrCompany
          }
          break
      }

      if (!content.trim()) {
        throw new Error('No content to enhance')
      }

      const response = await fetch('/api/admin/ai-enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: fieldType,
          content: content.trim(),
          context
        })
      })

      if (!response.ok) {
        throw new Error('Enhancement failed')
      }

      const result = await response.json()

      // Update the form data with enhanced content
      if (fieldType === 'profile') {
        setFormData(prev => ({ ...prev, profile: result.enhancedContent }))
      } else if (fieldType === 'hobbies') {
        setFormData(prev => ({ ...prev, hobbiesAndInterests: result.enhancedContent }))
      } else if (fieldType === 'experience' && experienceIndex !== null) {
        const updatedExperience = [...formData.experience]
        updatedExperience[experienceIndex].bullets = result.enhancedContent.split('\n').filter(bullet => bullet.trim())
        setFormData(prev => ({ ...prev, experience: updatedExperience }))
      }
      
      // Mark as having unsaved changes (AI enhancements count as changes)
      setHasUnsavedChanges(true)

    } catch (error) {
      console.error('Enhancement error:', error)
      throw error
    }
  }

  const loadSubmissionData = async () => {
    try {
      const response = await fetch(`/api/admin/get-submission?id=${id}`)
      if (response.ok) {
        const { submission } = await response.json()
        const data = submission.studentData || {}
        
        // Check if CV is published
        setIsPublished(submission.status === 'published')
        
        setFormData({
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
          additionalNotes: data.additionalNotes || ''
        })
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setHasUnsavedChanges(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB')
        return
      }
      
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }))
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
    
    try {
      const response = await fetch('/api/admin/update-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: id,
          studentData: formData
        })
      })
      
      if (response.ok) {
        setSubmitMessage('CV updated successfully!')
        setHasUnsavedChanges(false) // Reset unsaved changes flag
        // Redirect back to admin dashboard after 2 seconds
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      } else {
        // Get specific error message from server
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('Update failed:', response.status, errorData)
        setSubmitMessage(`Update failed: ${errorData.message || 'Please try again.'}`)
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
            
            {!isAuthenticated ? (
              /* Authentication Form */
              <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                  <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                      Admin Access Required
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                      Please sign in to edit CV submissions
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                        placeholder="Admin password"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                        style={{ backgroundColor: '#14b8a6' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9488'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#14b8a6'}
                      >
                        Sign in
                      </button>
                    </div>
                  </form>
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
                                      ? 'border-indigo-500 text-gray-900'
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
                              onClick={() => router.push(item.href)}
                              aria-current={item.current ? 'page' : undefined}
                              className={classNames(
                                item.current
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
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
                        <div className="bg-white">

                  {/* Breadcrumb Navigation */}
            <div className="mb-8">
              <nav aria-label="Back" className="sm:hidden">
                <button 
                  onClick={handleBackToAdmin}
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
                      <button 
                        onClick={() => router.push('/admin')}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        Dashboard
                      </button>
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
              <div className="mt-4 flex shrink-0 space-x-3 md:mt-0 md:ml-4">
                <button
                  onClick={handleBackToAdmin}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                >
                  Back to Dashboard
                </button>
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

            {/* AI Enhancement Section */}
            <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Enhancement</h2>
                  <p className="text-sm text-gray-600 max-w-2xl">
                    Automatically enhance your CV content with AI. This will improve the Profile Summary, 
                    Hobbies & Interests, and Work Experience descriptions to be more professional and yacht industry-focused.
                  </p>
                </div>
                <div className="ml-6">
                  <button
                    type="button"
                    onClick={enhanceAllFields}
                    disabled={enhancingAll}
                    className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {enhancingAll ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enhancing...
                      </>
                    ) : (
                      <>
                        ✨
                        AI Enhance
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

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
                        {isPublished && (
                          <span className="text-xs text-amber-600 block mt-1">🔒 Cannot edit after publication</span>
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
                          disabled={isPublished}
                          className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6 ${
                            isPublished ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          }`}
                        />
                        {isPublished && (
                          <p className="mt-1 text-sm text-amber-600">
                            The first name cannot be changed after the CV has been published because it's part of the public URL.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Last name
                        {isPublished && (
                          <span className="text-xs text-amber-600 block mt-1">🔒 Cannot edit after publication</span>
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
                          disabled={isPublished}
                          className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6 ${
                            isPublished ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          }`}
                        />
                        {isPublished && (
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
                          {formData.profilePicture ? (
                            <img
                              src={typeof formData.profilePicture === 'string' ? formData.profilePicture : URL.createObjectURL(formData.profilePicture)}
                              alt="Profile preview"
                              className="size-24 rounded-full object-cover ring-2 ring-gray-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {!formData.profilePicture && (
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
                            />
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
                                <button
                                  type="button"
                                  onClick={() => enhanceField('experience', null, index)}
                                  disabled={enhancingFields[`experience-${index}`]}
                                  className="absolute top-2 right-2 inline-flex items-center p-2 rounded-md text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Enhance with AI"
                                >
                                  {enhancingFields[`experience-${index}`] ? (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                  )}
                                </button>
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
                        Skills <span className="text-sm text-gray-500">(comma-separated)</span>
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
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          Separate each skill with a comma. Example: Communication, Leadership, Safety Protocols
                        </p>
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
                            maxLength="500"
                            placeholder="Write a brief professional summary about yourself, your experience, and career goals..."
                            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-2xl sm:text-sm sm:leading-6"
                          />
                          <button
                            type="button"
                            onClick={() => enhanceField('profile')}
                            disabled={enhancingFields.profile}
                            className="absolute top-2 right-2 inline-flex items-center p-2 rounded-md text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Enhance with AI"
                          >
                            {enhancingFields.profile ? (
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {formData.profile.length}/500 characters
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
                          <button
                            type="button"
                            onClick={() => enhanceField('hobbies')}
                            disabled={enhancingFields.hobbies}
                            className="absolute top-2 right-2 inline-flex items-center p-2 rounded-md text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Enhance with AI"
                          >
                            {enhancingFields.hobbies ? (
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            )}
                          </button>
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
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Website (optional)</label>
                                  <input
                                    type="text"
                                    value={ref.website}
                                    onChange={(e) => handleObjectArrayChange('references', index, 'website', e.target.value)}
                                    placeholder="https://linkedin.com/in/username"
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
                            onClick={() => addObjectArrayItem('references', { name: '', roleOrRelation: '', contact: '', website: '' })}
                            className="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
                            style={{ backgroundColor: '#14b8a6' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9488'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#14b8a6'}
                          >
                            Add Reference
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
                    onClick={handleBackToAdmin}
                    className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    Back to Dashboard
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
              
              {/* Progress Modal */}
              {showProgressModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">✨ AI Enhancement Progress</h3>
                      <div className="text-sm text-gray-500">
                        {currentStep + 1} of {progressSteps.length}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {progressSteps.map((step, index) => (
                        <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          step.status === 'processing' ? 'bg-blue-50 border border-blue-200' :
                          step.status === 'completed' ? 'bg-green-50 border border-green-200' :
                          'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className="flex-shrink-0">
                            {step.status === 'completed' ? (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : step.status === 'processing' ? (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="animate-spin w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              step.status === 'processing' ? 'text-blue-700' :
                              step.status === 'completed' ? 'text-green-700' :
                              'text-gray-700'
                            }`}>
                              {step.title}
                            </p>
                            {step.status === 'processing' && (
                              <p className="text-xs text-blue-600 mt-1">Enhancing...</p>
                            )}
                            {step.status === 'completed' && (
                              <p className="text-xs text-green-600 mt-1">Enhanced ✓</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep + 1) / progressSteps.length) * 100}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-sm text-gray-600 text-center">
                      {currentStep < progressSteps.length ? 
                        `Enhancing ${progressSteps[currentStep]?.title}...` :
                        'Finalizing enhancements...'
                      }
                    </p>
                  </div>
                </div>
              )}
      </div>
    </>
  )
} 
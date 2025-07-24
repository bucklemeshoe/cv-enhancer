import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { EnvelopeIcon } from '@heroicons/react/20/solid'

export default function Apply() {
  const router = useRouter()
  const [showDiscardModal, setShowDiscardModal] = useState(false)
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

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
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
      const value = formData[field.key]
      let isCompleted = false

      if (field.isFile) {
        isCompleted = value !== null
      } else if (field.isArray) {
        isCompleted = Array.isArray(value) && value.some(item => item.trim() !== '')
      } else if (field.isComplexArray) {
        if (field.key === 'experience') {
          isCompleted = Array.isArray(value) && value.some(exp => 
            exp.role.trim() !== '' && exp.vesselOrCompany.trim() !== '' && exp.startDate.trim() !== ''
          )
        } else if (field.key === 'certifications') {
          isCompleted = Array.isArray(value) && value.some(cert => cert.name.trim() !== '')
        } else if (field.key === 'education') {
          isCompleted = Array.isArray(value) && value.some(edu => 
            edu.qualification.trim() !== '' && edu.institution.trim() !== ''
          )
        } else if (field.key === 'references') {
          isCompleted = Array.isArray(value) && value.some(ref => 
            ref.name.trim() !== '' && ref.roleOrRelation.trim() !== '' && ref.contact.trim() !== ''
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

  const completionPercentage = calculateCompletionPercentage()

  // Check if form has been started (any field has content)
  const hasFormData = () => {
    const checkObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.some(item => {
          if (typeof item === 'string') return item.trim() !== ''
          if (typeof item === 'object') return checkObject(item)
          return false
        })
      }
      if (typeof obj === 'object' && obj !== null) {
        return Object.values(obj).some(value => checkObject(value))
      }
      if (typeof obj === 'string') return obj.trim() !== ''
      return obj !== null && obj !== undefined
    }
    
    return Object.entries(formData).some(([key, value]) => {
      if (key === 'profilePicture') return value !== null
      return checkObject(value)
    })
  }

  const handleDiscard = () => {
    if (hasFormData()) {
      setShowDiscardModal(true)
    } else {
      router.push('/')
    }
  }

  const confirmDiscard = () => {
    setShowDiscardModal(false)
    router.push('/')
  }

  const cancelDiscard = () => {
    setShowDiscardModal(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
  }

  const handleObjectArrayChange = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    }))
  }

  const addArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }))
  }

  const addObjectArrayItem = (field, defaultObject) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultObject]
    }))
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'profilePicture') {
          if (formData.profilePicture) {
            submitData.append('profilePicture', formData.profilePicture)
          }
        } else {
          submitData.append(key, typeof formData[key] === 'object' ? JSON.stringify(formData[key]) : formData[key])
        }
      })

      const response = await fetch('/api/submit-application', {
        method: 'POST',
        body: submitData,
      })
      
      if (response.ok) {
        setSubmitMessage('Application submitted successfully! You will receive an email confirmation shortly.')
        setFormData({
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
          targetRole: '',
          experience: [{ role: '', vesselOrCompany: '', startDate: '', endDate: '', location: '', vesselDetails: '', bullets: [''] }],
          skills: '',
          certifications: [{ name: '', issuer: '', date: '' }],
          education: [{ qualification: '', institution: '', startDate: '', endDate: '' }],
          highestQualification: '',
          profile: '',
          hobbiesAndInterests: '',
          references: [{ name: '', roleOrRelation: '', contact: '', website: '' }],
          availability: '',
          salaryExpectation: '',
          additionalNotes: ''
        })
      } else {
        setSubmitMessage('Error submitting application. Please try again.')
      }
    } catch (error) {
      setSubmitMessage('Error submitting application. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  return (
    <>
      <Head>
        <title>Apply for CV Enhancement - Professional Yacht Crew CVs</title>
        <meta name="description" content="Submit your information for professional CV enhancement" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
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
      
      {/* Header Section */}
      <div>
        <div>
          <div className="h-32 w-full lg:h-48 bg-gradient-to-r from-teal-500 to-blue-600"></div>
        </div>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
            <div className="flex">
              <img 
                alt="Pull North Logo" 
                src="/images/Pull North Stamp design.png" 
                className="size-24 rounded-full ring-4 ring-white sm:size-32 bg-white p-2 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
                         <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
             </div>
          </div>
          
        </div>
      </div>
      
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white">
            
            {/* Breadcrumb Navigation */}
            <div className="mb-8">
              <nav aria-label="Back" className="sm:hidden">
                <a href="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                  <ChevronLeftIcon aria-hidden="true" className="mr-1 -ml-1 size-5 shrink-0 text-gray-400" />
                  Back
                </a>
              </nav>
              <nav aria-label="Breadcrumb" className="hidden sm:flex">
                <ol role="list" className="flex items-center space-x-4">
                  <li>
                    <div className="flex">
                      <a href="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                        Home
                      </a>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                      <span aria-current="page" className="ml-4 text-sm font-medium text-gray-500">
                        CV Application
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
                  Apply for Professional CV Enhancement
                </h1>
                <p className="mt-2 text-lg text-gray-600 max-w-3xl leading-relaxed">
                                    Submit your information and we'll create a professional, industry-standard CV for your yacht crew career. 
                  All information will be reviewed and enhanced before publication.
                </p>
              </div>
              <div className="mt-4 flex shrink-0 md:mt-0 md:ml-4">
                <a
                  href="mailto:team@pullnorth.com"
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                >
                  <EnvelopeIcon aria-hidden="true" className="mr-1.5 -ml-0.5 size-5 text-gray-400" />
                  Contact
                </a>
              </div>
            </div>

            {/* Completion Progress */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Application Progress</h3>
                <span className="text-2xl font-bold text-teal-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${completionPercentage}%`,
                    backgroundColor: completionPercentage >= 100 ? '#059669' : completionPercentage >= 75 ? '#0d9488' : completionPercentage >= 50 ? '#14b8a6' : '#6b7280'
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {completionPercentage < 25 ? 'Just getting started...' :
                   completionPercentage < 50 ? 'Making good progress!' :
                   completionPercentage < 75 ? 'Almost halfway there!' :
                   completionPercentage < 100 ? 'Nearly complete!' :
                   'Ready to publish! 🎉'}
                </span>
                <span className="text-gray-500">
                  {completionPercentage >= 100 ? 'Ready for Publishing' : 'Complete all fields to enable publishing'}
                </span>
              </div>
              {completionPercentage >= 100 && (
                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-green-800">
                      Excellent! Your application is complete and ready to be submitted for professional enhancement and publishing.
                    </p>
                  </div>
                </div>
              )}
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
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5">
                        Last name
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6"
                        />
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
                              src={URL.createObjectURL(formData.profilePicture)}
                              alt="Profile preview"
                              className="size-24 rounded-full object-cover ring-2 ring-gray-300"
                            />
                          ) : (
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
                              <textarea
                                value={exp.bullets.join('\n')}
                                onChange={(e) => handleObjectArrayChange('experience', index, 'bullets', e.target.value.split('\n'))}
                                placeholder="Key responsibilities and achievements (one per line)"
                                rows="3"
                                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                              />
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
                        <textarea
                          name="hobbiesAndInterests"
                          id="hobbiesAndInterests"
                          rows={2}
                          value={formData.hobbiesAndInterests}
                          onChange={handleInputChange}
                          placeholder="e.g., Running & Swimming, Ocean & Adventure Sports, Photography, Cultural Exchange, Water Sports"
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-2xl sm:text-sm sm:leading-6"
                        />
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
                <div className="mt-6 flex items-center justify-between gap-x-6">
                  <div className="flex items-center gap-x-4">
                    <button 
                      type="button" 
                      onClick={handleDiscard}
                      className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors"
                    >
                      Discard
                    </button>
                    <div className="text-sm text-gray-600">
                      Progress: <span className="font-semibold text-teal-600">{completionPercentage}%</span> complete
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center items-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ backgroundColor: isSubmitting ? '#6b7280' : completionPercentage >= 100 ? '#059669' : '#14b8a6' }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) e.target.style.backgroundColor = completionPercentage >= 100 ? '#047857' : '#0d9488'
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting) e.target.style.backgroundColor = completionPercentage >= 100 ? '#059669' : '#14b8a6'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : completionPercentage >= 100 ? 'Submit for Publishing' : 'Submit Application'}
                      {completionPercentage >= 100 && !isSubmitting && (
                        <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    {completionPercentage < 100 && (
                      <p className="text-xs text-gray-500 text-right">
                        {Math.ceil((19 - Math.round((completionPercentage / 100) * 19)))} more fields needed for publishing
                      </p>
                    )}
                    {completionPercentage >= 100 && (
                      <p className="text-xs text-green-600 text-right font-medium">
                        ✓ Ready for professional enhancement & publishing
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Discard Application?
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                You have unsaved changes. Are you sure you want to discard your progress and return to the home page? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelDiscard}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  Continue Here
                </button>
                <button
                  onClick={confirmDiscard}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose-500 border border-transparent rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                >
                  Discard & Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 
/**
 * Form Structure Validation Utility
 * Prevents application vs admin edit form mismatches
 */

// Define the expected form structure
export const EXPECTED_FORM_STRUCTURE = {
  // Personal Information
  firstName: 'string',
  lastName: 'string', 
  email: 'string',
  phone: 'string',
  location: 'string',
  nationality: 'string',
  languages: 'array',
  visa: 'array', 
  health: 'string',
  profilePicture: 'file_or_string_or_null',
  
  // Professional Information
  targetRole: 'string',
  experience: 'complex_array',
  
  // Skills & Certifications
  skills: 'string',
  certifications: 'complex_array',
  
  // Education
  education: 'complex_array',
  highestQualification: 'string',
  
  // Personal Profile
  profile: 'string',
  hobbiesAndInterests: 'string',
  
  // References  
  references: 'complex_array',
  
  // Additional Info
  availability: 'string',
  salaryExpectation: 'string',
  additionalNotes: 'string'
}

// Define expected structures for complex arrays
export const COMPLEX_ARRAY_STRUCTURES = {
  experience: {
    role: 'string',
    vesselOrCompany: 'string', 
    startDate: 'string',
    endDate: 'string',
    location: 'string',
    vesselDetails: 'string',
    bullets: 'array'
  },
  certifications: {
    name: 'string',
    issuer: 'string', 
    date: 'string'
  },
  education: {
    qualification: 'string',
    institution: 'string',
    startDate: 'string', 
    endDate: 'string'
  },
  references: {
    name: 'string',
    roleOrRelation: 'string',
    contact: 'string',
    website: 'string'
  }
}

/**
 * Validate that a form data object matches the expected structure
 */
export function validateFormStructure(formData, context = 'unknown') {
  const errors = []
  const warnings = []
  
  // Check top-level fields
  Object.keys(EXPECTED_FORM_STRUCTURE).forEach(field => {
    if (!(field in formData)) {
      errors.push(`Missing field: ${field}`)
    }
  })
  
  // Check for unexpected fields
  Object.keys(formData).forEach(field => {
    if (!(field in EXPECTED_FORM_STRUCTURE)) {
      warnings.push(`Unexpected field: ${field}`)
    }
  })
  
  // Validate complex array structures
  Object.keys(COMPLEX_ARRAY_STRUCTURES).forEach(arrayField => {
    if (formData[arrayField] && Array.isArray(formData[arrayField]) && formData[arrayField].length > 0) {
      const expectedStructure = COMPLEX_ARRAY_STRUCTURES[arrayField]
      const firstItem = formData[arrayField][0]
      
      if (typeof firstItem === 'object' && firstItem !== null) {
        // Check required fields in complex array items
        Object.keys(expectedStructure).forEach(subField => {
          if (!(subField in firstItem)) {
            errors.push(`Missing field in ${arrayField}[0]: ${subField}`)
          }
        })
        
        // Check for unexpected fields in complex array items
        Object.keys(firstItem).forEach(subField => {
          if (!(subField in expectedStructure)) {
            warnings.push(`Unexpected field in ${arrayField}[0]: ${subField}`)
          }
        })
      }
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    context
  }
}

/**
 * Compare two form structures to identify mismatches
 */
export function compareFormStructures(form1, form2, context1 = 'form1', context2 = 'form2') {
  const validation1 = validateFormStructure(form1, context1)
  const validation2 = validateFormStructure(form2, context2)
  
  const mismatches = []
  
  // Find fields present in one but not the other
  const fields1 = Object.keys(form1)
  const fields2 = Object.keys(form2)
  
  fields1.forEach(field => {
    if (!fields2.includes(field)) {
      mismatches.push(`Field '${field}' exists in ${context1} but not in ${context2}`)
    }
  })
  
  fields2.forEach(field => {
    if (!fields1.includes(field)) {
      mismatches.push(`Field '${field}' exists in ${context2} but not in ${context1}`)
    }
  })
  
  return {
    form1Validation: validation1,
    form2Validation: validation2,
    mismatches,
    areCompatible: mismatches.length === 0 && validation1.isValid && validation2.isValid
  }
}

/**
 * Development helper to log validation results
 */
export function logValidationResults(validation) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 Form Validation: ${validation.context}`)
    
    if (validation.isValid) {
      console.log('✅ Form structure is valid')
    } else {
      console.error('❌ Form structure validation failed')
      validation.errors.forEach(error => console.error(`  • ${error}`))
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Warnings:')
      validation.warnings.forEach(warning => console.warn(`  • ${warning}`))
    }
    
    console.groupEnd()
  }
}

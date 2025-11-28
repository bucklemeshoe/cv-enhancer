require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const email = 'jared+0010@makefriendly.co.za'
const password = 'TestPassword123!'

// Sample CV data - CV 1
const cv1Data = {
  firstName: 'Sarah',
  lastName: 'Mitchell',
  email: email,
  phone: '+27 (0)82 555 1234',
  location: 'Cape Town, South Africa',
  website: 'https://sarahmitchell.crew',
  nationality: 'South African',
  languages: [
    'English (Native)',
    'Afrikaans (Fluent)',
    'French (Conversational)'
  ],
  visa: [
    'South African Passport',
    'Schengen Visa (Valid until 2026)'
  ],
  health: 'Excellent health, ENG1 Medical Certificate valid until 2026',
  profilePicture: '/images/profile-photo.png',
  targetRole: 'Chief Stewardess',
  experience: [
    {
      role: 'Chief Stewardess',
      vesselOrCompany: 'M/Y Ocean Dream',
      startDate: '2023-06-01',
      endDate: '2024-12-01',
      location: 'Mediterranean',
      vesselDetails: '65 meters Motor Yacht',
      bullets: [
        'Managed team of 4 stewardesses',
        'Coordinated guest services for up to 12 guests',
        'Maintained inventory and provisioning',
        'Organized events and special occasions'
      ]
    },
    {
      role: 'Stewardess',
      vesselOrCompany: 'S/Y Wind Spirit',
      startDate: '2022-03-01',
      endDate: '2023-05-01',
      location: 'Caribbean',
      vesselDetails: '50 meters Sailing Yacht',
      bullets: [
        'Guest services and housekeeping',
        'Table service and silver service',
        'Laundry and cabin maintenance'
      ]
    },
    {
      role: 'Junior Stewardess',
      vesselOrCompany: 'M/Y Sea Breeze',
      startDate: '2021-01-01',
      endDate: '2022-02-01',
      location: 'Mediterranean',
      vesselDetails: '45 meters Motor Yacht',
      bullets: [
        'Housekeeping and cabin service',
        'Assisted with guest services',
        'Maintained interior standards'
      ]
    }
  ],
  skills: 'Guest Relations, Event Planning, Silver Service, Wine Service, Interior Management, Inventory Control, Team Leadership, Laundry, Flower Arranging, Table Setting, Mixology, Food Safety',
  certifications: [
    {
      name: 'STCW Basic Safety Training',
      issuer: 'MCA Approved Training Center',
      date: '2021'
    },
    {
      name: 'ENG1 Medical Certificate',
      issuer: 'MCA Approved Doctor',
      date: 'Valid until 2026'
    },
    {
      name: 'Food Safety & Hygiene Level 3',
      issuer: 'CIEH',
      date: '2022'
    },
    {
      name: 'Wine & Spirits Education Trust Level 2',
      issuer: 'WSET',
      date: '2023'
    },
    {
      name: 'Silver Service & Fine Dining',
      issuer: 'Yacht Stewardess Academy',
      date: '2022'
    },
    {
      name: 'First Aid & CPR Certified',
      issuer: 'Red Cross',
      date: 'Valid until 2025'
    }
  ],
  education: [
    {
      qualification: 'Bachelor of Hospitality Management',
      institution: 'University of Cape Town',
      startDate: '2017-01-01',
      endDate: '2020-12-01'
    },
    {
      qualification: 'Yacht Interior Course',
      institution: 'Bluewater Yachting',
      startDate: '2020-11-01',
      endDate: '2021-01-01'
    }
  ],
  highestQualification: 'Bachelor of Hospitality Management',
  profile: 'Experienced Chief Stewardess with over 4 years in the yachting industry, specializing in luxury guest services and interior management. Proven track record of leading teams and maintaining the highest standards of service on vessels ranging from 45-65 meters. Passionate about creating exceptional guest experiences and ensuring seamless operations. Strong organizational skills, attention to detail, and ability to work effectively in fast-paced environments.',
  hobbiesAndInterests: 'Wine Tasting, Cooking & Culinary Arts, Yoga & Wellness, Travel & Cultural Exploration, Photography, Reading, Sailing, Event Planning, Interior Design',
  references: [
    {
      name: 'Captain James Anderson',
      roleOrRelation: 'Captain, M/Y Ocean Dream',
      contact: '+33 6 11 22 33 44',
      website: ''
    },
    {
      name: 'Emma Thompson',
      roleOrRelation: 'Purser, M/Y Ocean Dream',
      contact: 'emma.thompson@oceandream.yacht',
      website: 'https://linkedin.com/in/emmathompson'
    },
    {
      name: 'Michael Chen',
      roleOrRelation: 'Captain, S/Y Wind Spirit',
      contact: '+1 305 555 7890',
      website: ''
    }
  ],
  availability: 'Available immediately',
  salaryExpectation: '',
  additionalNotes: ''
}

// Sample CV data - CV 2
const cv2Data = {
  firstName: 'David',
  lastName: 'Roberts',
  email: email,
  phone: '+27 (0)83 444 5678',
  location: 'Durban, South Africa',
  website: 'https://davidroberts.crew',
  nationality: 'South African',
  languages: [
    'English (Native)',
    'Zulu (Conversational)',
    'Portuguese (Basic)'
  ],
  visa: [
    'South African Passport',
    'B1/B2 US Visa (Valid until 2027)'
  ],
  health: 'Excellent health, ENG1 Medical Certificate valid until 2025',
  profilePicture: '/images/profile-photo.png',
  targetRole: 'Deckhand',
  experience: [
    {
      role: 'Deckhand',
      vesselOrCompany: 'M/Y Serenity',
      startDate: '2023-09-01',
      endDate: '2024-11-01',
      location: 'Caribbean & Mediterranean',
      vesselDetails: '55 meters Motor Yacht',
      bullets: [
        'Deck maintenance and washdowns',
        'Tender operations and driving',
        'Water sports equipment management',
        'Anchor watch and line handling'
      ]
    },
    {
      role: 'Junior Deckhand',
      vesselOrCompany: 'S/Y Freedom',
      startDate: '2022-05-01',
      endDate: '2023-08-01',
      location: 'Mediterranean',
      vesselDetails: '48 meters Sailing Yacht',
      bullets: [
        'Deck maintenance',
        'Sail handling',
        'Guest assistance',
        'Safety equipment checks'
      ]
    }
  ],
  skills: 'Deck Maintenance, Tender Operations, Water Sports, Navigation, Line Handling, Safety Protocols, Guest Services, Washdowns, Varnishing, Teak Maintenance, Emergency Response, Teamwork',
  certifications: [
    {
      name: 'STCW Basic Safety Training',
      issuer: 'MCA Approved Training Center',
      date: '2022'
    },
    {
      name: 'ENG1 Medical Certificate',
      issuer: 'MCA Approved Doctor',
      date: 'Valid until 2025'
    },
    {
      name: 'Powerboat Level 2',
      issuer: 'RYA Training Center',
      date: '2022'
    },
    {
      name: 'VHF Radio Operator\'s License',
      issuer: 'Ofcom',
      date: '2022'
    },
    {
      name: 'PADI Open Water Diver',
      issuer: 'PADI',
      date: '2023'
    },
    {
      name: 'First Aid & CPR Certified',
      issuer: 'Red Cross',
      date: 'Valid until 2025'
    }
  ],
  education: [
    {
      qualification: 'Matric Certificate',
      institution: 'Durban High School',
      startDate: '2018-01-01',
      endDate: '2021-12-01'
    },
    {
      qualification: 'Maritime Safety Training',
      institution: 'South African Maritime Safety Authority',
      startDate: '2022-01-01',
      endDate: '2022-03-01'
    }
  ],
  highestQualification: 'Matric Certificate',
  profile: 'Dedicated and hardworking deckhand with 2+ years of experience in the yachting industry. Skilled in all aspects of deck operations, from maintenance to guest services. Passionate about water sports and ensuring guest safety and satisfaction. Strong work ethic, excellent physical fitness, and ability to work effectively as part of a team. Eager to continue learning and growing in the maritime industry.',
  hobbiesAndInterests: 'Surfing, Scuba Diving, Fishing, Water Sports, Fitness & Training, Photography, Travel, Sailing, Beach Volleyball',
  references: [
    {
      name: 'Captain Lisa Martinez',
      roleOrRelation: 'Captain, M/Y Serenity',
      contact: '+1 954 555 1234',
      website: ''
    },
    {
      name: 'Bosun Tom Wilson',
      roleOrRelation: 'Bosun, M/Y Serenity',
      contact: 'tom.wilson@serenity.yacht',
      website: 'https://linkedin.com/in/tomwilson'
    },
    {
      name: 'Captain Peter Brown',
      roleOrRelation: 'Captain, S/Y Freedom',
      contact: '+33 6 98 76 54 32',
      website: ''
    }
  ],
  availability: 'Available from February 2025',
  salaryExpectation: '',
  additionalNotes: ''
}

async function createUserAndCVs() {
  try {
    console.log('🔍 Checking if user exists...')
    
    // Check if user exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError)
      throw listError
    }
    
    let user = existingUsers.users.find(u => u.email === email)
    
    if (!user) {
      console.log('👤 Creating new user account...')
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true // Auto-confirm email for testing
      })
      
      if (createError) {
        console.error('❌ Error creating user:', createError)
        throw createError
      }
      
      user = newUser.user
      console.log('✅ User created:', user.id)
    } else {
      console.log('✅ User already exists:', user.id)
    }
    
    // Generate unique IDs for CVs
    const uniqueId1 = Math.random().toString(36).substring(2, 8).toUpperCase()
    const uniqueId2 = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    console.log('\n📝 Creating CV 1 (Sarah Mitchell)...')
    const { data: cv1, error: error1 } = await supabase
      .from('submissions')
      .insert([{
        unique_id: uniqueId1,
        submitted_at: new Date().toISOString(),
        status: 'pending',
        student_data: cv1Data,
        published_slug: uniqueId1,
        user_id: user.id
      }])
      .select()
      .single()
    
    if (error1) {
      console.error('❌ Error creating CV 1:', error1)
      throw error1
    }
    
    console.log('✅ CV 1 created:', {
      id: cv1.id,
      uniqueId: uniqueId1,
      name: `${cv1Data.firstName} ${cv1Data.lastName}`
    })
    
    console.log('\n📝 Creating CV 2 (David Roberts)...')
    const { data: cv2, error: error2 } = await supabase
      .from('submissions')
      .insert([{
        unique_id: uniqueId2,
        submitted_at: new Date().toISOString(),
        status: 'pending',
        student_data: cv2Data,
        published_slug: uniqueId2,
        user_id: user.id
      }])
      .select()
      .single()
    
    if (error2) {
      console.error('❌ Error creating CV 2:', error2)
      throw error2
    }
    
    console.log('✅ CV 2 created:', {
      id: cv2.id,
      uniqueId: uniqueId2,
      name: `${cv2Data.firstName} ${cv2Data.lastName}`
    })
    
    console.log('\n🎉 Success! Created 2 CVs for:', email)
    console.log('\n📊 Summary:')
    console.log(`   User ID: ${user.id}`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   CV 1: ${cv1Data.firstName} ${cv1Data.lastName} (${uniqueId1})`)
    console.log(`   CV 2: ${cv2Data.firstName} ${cv2Data.lastName} (${uniqueId2})`)
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

createUserAndCVs()


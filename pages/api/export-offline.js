import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { slug } = req.query

    if (!slug) {
      return res.status(400).json({ message: 'Missing slug parameter' })
    }

    // Get published CV from Supabase by slug
    const { data: publishedCV, error } = await supabase
      .from('published_cvs')
      .select('cv_data')
      .eq('slug', slug)
      .single()

    if (error || !publishedCV) {
      console.error('Error loading CV data from Supabase:', error)
      return res.status(404).json({ message: 'CV not found' })
    }

    const cvData = publishedCV.cv_data

    // Generate standalone HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cvData.header?.name || 'CV'} - Offline Print</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Offline Print Styles */
        @page {
            size: A4 portrait;
            margin: 0.5in;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .print-container {
            width: 100%;
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
        }
        
        .print-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 20pt;
            padding-bottom: 10pt;
            border-bottom: 1pt solid #ccc;
        }
        
        .print-header-left {
            flex: 1;
        }
        
        .print-header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 4pt;
            color: #000;
        }
        
        .print-header .title {
            font-size: 14pt;
            font-weight: 500;
            color: #0d7377;
            margin-bottom: 8pt;
        }
        
        .print-header .contact {
            font-size: 9pt;
            color: #374151;
            line-height: 1.4;
        }
        
        .print-header .contact-item {
            margin-bottom: 2pt;
        }
        
        .print-header .photo {
            width: 60pt;
            height: 60pt;
            border-radius: 50%;
            object-fit: cover;
            border: 2pt solid #e5e7eb;
            margin-left: 12pt;
        }
        
        .print-badge {
            width: 30pt;
            height: 30pt;
            object-fit: contain;
            margin-left: 8pt;
        }
        
        .print-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 16pt;
        }
        
        .print-section {
            margin-bottom: 12pt;
            page-break-inside: avoid;
        }
        
        .print-section h2 {
            font-size: 11pt;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            margin-bottom: 6pt;
            padding-bottom: 2pt;
            border-bottom: 0.5pt solid #e5e7eb;
        }
        
        .print-section h3 {
            font-size: 10pt;
            font-weight: 600;
            color: #000;
            margin-bottom: 4pt;
        }
        
        .print-section p {
            font-size: 10pt;
            line-height: 1.4;
            margin-bottom: 4pt;
            color: #374151;
        }
        
        .print-section ul {
            margin-left: 12pt;
            margin-bottom: 6pt;
        }
        
        .print-section li {
            font-size: 9pt;
            line-height: 1.4;
            margin-bottom: 2pt;
            color: #374151;
        }
        
        .experience-item {
            margin-bottom: 10pt;
            page-break-inside: avoid;
        }
        
        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 3pt;
        }
        
        .experience-header h4 {
            font-size: 10pt;
            font-weight: 600;
            color: #000;
            margin: 0;
        }
        
        .experience-header .company {
            font-size: 9pt;
            color: #0d7377;
            font-weight: 500;
        }
        
        .experience-header .dates {
            font-size: 8pt;
            color: #6b7280;
            white-space: nowrap;
        }
        
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6pt;
        }
        
        .skill-item {
            font-size: 9pt;
            font-weight: 500;
            color: #0d7377;
            border-bottom: 0.5pt solid #0d7377;
            padding-bottom: 1pt;
            display: inline-block;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 4pt;
            margin-bottom: 3pt;
        }
        
        .contact-item svg {
            width: 8pt;
            height: 8pt;
            fill: #0d7377;
        }
        
        .wave-pattern {
            height: 30pt;
            width: 100%;
            fill: #f0f0f0;
        }
        
        /* Hide interactive elements */
        .no-print, button, .print-controls {
            display: none !important;
        }
        
        /* Remove shadows and borders */
        * {
            box-shadow: none !important;
            border-radius: 0 !important;
        }
        
        /* Page break control */
        .page-break-before { page-break-before: always; }
        .page-break-after { page-break-after: always; }
        .page-break-inside-avoid { page-break-inside: avoid; }
    </style>
</head>
<body>
    <div class="print-container">
        <!-- Header -->
        <div class="print-header">
            <div class="print-header-left">
                <h1>${cvData.header?.name || ''}</h1>
                <div class="title">${cvData.header?.title || ''}</div>
                <div class="contact">
                    ${cvData.header?.email ? `<div class="contact-item">📧 ${cvData.header.email}</div>` : ''}
                    ${cvData.header?.phone ? `<div class="contact-item">📞 ${cvData.header.phone}</div>` : ''}
                    ${cvData.header?.location ? `<div class="contact-item">📍 ${cvData.header.location}</div>` : ''}
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                ${cvData.header?.photo ? `<img src="${cvData.header.photo}" alt="Profile Photo" class="photo">` : ''}
                ${cvData.header?.showBadge ? `<img src="/shape_converted.png" alt="Pull North Badge" class="print-badge">` : ''}
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="print-content">
            <!-- Left Column -->
            <div>
                ${cvData.profile ? `
                <div class="print-section">
                    <h2>Professional Summary</h2>
                    <p>${cvData.profile}</p>
                </div>
                ` : ''}
                
                ${cvData.certifications && cvData.certifications.length > 0 ? `
                <div class="print-section">
                    <h2>Certifications</h2>
                    ${cvData.certifications.map(cert => `
                        <div class="experience-item">
                            <h3>${cert.name || ''}</h3>
                            <p><strong>Issuer:</strong> ${cert.issuer || ''}</p>
                            <p><strong>Date:</strong> ${cert.date || ''}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${cvData.experience && cvData.experience.length > 0 ? `
                <div class="print-section">
                    <h2>Work Experience</h2>
                    ${cvData.experience.map(exp => `
                        <div class="experience-item">
                            <div class="experience-header">
                                <div>
                                    <h4>${exp.role || ''}</h4>
                                    <div class="company">${exp.vesselOrCompany || ''}</div>
                                </div>
                                <div class="dates">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
                            </div>
                            ${exp.bullets && exp.bullets.length > 0 ? `
                                <ul>
                                    ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
            
            <!-- Right Column -->
            <div>
                ${cvData.personalInformation ? `
                <div class="print-section">
                    <h2>Personal Information</h2>
                    ${cvData.personalInformation.location ? `<p><strong>Location:</strong> ${cvData.personalInformation.location}</p>` : ''}
                    ${cvData.personalInformation.nationality ? `<p><strong>Nationality:</strong> ${cvData.personalInformation.nationality}</p>` : ''}
                    ${cvData.personalInformation.languages && cvData.personalInformation.languages.length > 0 ? `
                        <p><strong>Languages:</strong> ${cvData.personalInformation.languages.join(', ')}</p>
                    ` : ''}
                    ${cvData.personalInformation.visa ? `<p><strong>Visa:</strong> ${cvData.personalInformation.visa}</p>` : ''}
                    ${cvData.personalInformation.health ? `<p><strong>Health:</strong> ${cvData.personalInformation.health}</p>` : ''}
                </div>
                ` : ''}
                
                ${cvData.skills && cvData.skills.length > 0 ? `
                <div class="print-section">
                    <h2>Skills</h2>
                    <div class="skills-container">
                        ${cvData.skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${cvData.hobbiesAndInterests && cvData.hobbiesAndInterests.length > 0 ? `
                <div class="print-section">
                    <h2>Hobbies & Interests</h2>
                    <p>${cvData.hobbiesAndInterests.join(', ')}</p>
                </div>
                ` : ''}
                
                ${cvData.education && cvData.education.length > 0 ? `
                <div class="print-section">
                    <h2>Education</h2>
                    ${cvData.education.map(edu => `
                        <div class="experience-item">
                            <h3>${edu.qualification || ''}</h3>
                            <p><strong>Institution:</strong> ${edu.institution || ''}</p>
                            <p><strong>Date:</strong> ${edu.date || ''}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${cvData.references && cvData.references.length > 0 ? `
                <div class="print-section">
                    <h2>References</h2>
                    ${cvData.references.map(ref => `
                        <div class="experience-item">
                            <h3>${ref.name || ''}</h3>
                            <p><strong>Position:</strong> ${ref.position || ''}</p>
                            <p><strong>Company:</strong> ${ref.company || ''}</p>
                            <p><strong>Contact:</strong> ${ref.contact || ''}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        </div>
    </div>
    
    <script>
        // Auto-print when opened
        window.onload = function() {
            setTimeout(() => {
                window.print();
            }, 1000);
        };
    </script>
</body>
</html>
    `

    // Set headers for file download
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${cvData.header?.name?.replace(/\s+/g, '-') || 'cv'}-offline-print.html`)
    
    res.status(200).send(html)

  } catch (error) {
    console.error('Error generating offline print:', error)
    res.status(500).json({ message: 'Error generating offline print' })
  }
}






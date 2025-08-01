# Pull North Yachting CV Builder 🛥️

**Live Production Service**: [cv.pullnorth.com](https://cv.pullnorth.com)

A complete workflow system for collecting yacht crew applications, enhancing them with AI-powered improvements, and publishing beautiful responsive CVs with professional URLs.

## 🌟 Key Features

### ✨ **AI-Powered Content Enhancement**
- **Individual field enhancement** with magic wand buttons for targeted improvements
- **Bulk "AI Enhance All"** with progress tracking modal
- **Conservative, professional approach** - polishes existing content without exaggeration
- **Specialized for yacht crew industry** with maritime terminology and best practices

### 🔗 **Professional URL Structure**
- **SEO-friendly URLs**: `/cvs/firstname-lastname-uniqueid` (e.g., `/cvs/jared-smith-ja8r3`)
- **Automatic slug generation** during CV publishing process
- **Shareable professional links** for easy employer access
- **Custom domain**: All CVs published at `cv.pullnorth.com/cvs/[name]`

### 🛡️ **Enhanced Admin Experience**
- **Unsaved changes protection** prevents data loss when navigating away
- **Streamlined CV editing interface** with consistent navigation
- **Real-time form validation** and user feedback
- **Progress tracking** for AI enhancement operations
- **Secure admin dashboard** with password protection

## 🚀 Complete Workflow

### Phase 1: Student Application
**URL**: [cv.pullnorth.com/apply](https://cv.pullnorth.com/apply)

Students submit comprehensive applications including:
- Personal information and contact details
- Work experience with detailed responsibilities
- Education and certifications
- Skills, languages, and hobbies
- Professional references
- Profile pictures with live preview

### Phase 2: Admin Review & Enhancement
**URL**: [cv.pullnorth.com/admin](https://cv.pullnorth.com/admin)

Administrators can:
- Review all submitted applications with status tracking
- Edit and enhance CV content with AI assistance
- Publish professional CVs with custom URLs
- Manage the complete application lifecycle

### Phase 3: Published CV Pages
**URL**: `cv.pullnorth.com/cvs/[firstname-lastname-id]`

Professional CV pages featuring:
- Responsive design optimized for all devices
- Print/PDF friendly layouts
- Professional typography and spacing
- Integrated profile photos
- Modern Pull North branding

## 🛠 Technical Stack

- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom Pull North branding
- **Typography**: Montserrat (headings) + Karla (body)
- **AI Integration**: OpenAI GPT models for content enhancement
- **File Storage**: Efficient JSON-based storage system
- **Deployment**: Netlify with custom domain
- **Version Control**: GitHub ([bucklemeshoe/cv-enhancer](https://github.com/bucklemeshoe/cv-enhancer))

## 📁 Project Structure

```
cv-builder/
├── pages/
│   ├── index.js                    # Professional homepage
│   ├── apply.js                    # Student application form
│   ├── admin.js                    # Admin dashboard
│   ├── admin/edit/[id].js          # CV editing interface with AI enhancement
│   ├── cvs/[slug].js               # Dynamic CV pages with slug mapping
│   └── api/
│       ├── submit-application.js   # Handle form submissions
│       └── admin/
│           ├── submissions.js      # List all submissions
│           ├── get-submission.js   # Fetch individual submission data
│           ├── update-submission.js# Update submission data
│           ├── publish-cv.js       # Publish CV with auto-generated URLs
│           ├── delete-cv.js        # Delete CV functionality
│           └── ai-enhance.js       # AI content enhancement API
├── components/                     # Reusable CV display components
├── data/
│   ├── submissions/               # Student application data
│   └── published/                 # Published CV data
├── public/
│   └── images/                    # Static assets and Pull North branding
└── styles/
    └── globals.css               # Custom styling and responsive design
```

## 🎯 Usage Guide

### For Yacht Crew Candidates:
1. Visit [cv.pullnorth.com/apply](https://cv.pullnorth.com/apply)
2. Fill out comprehensive CV information
3. Upload profile picture with live preview
4. Submit application for professional review
5. Receive professional CV URL once published (e.g., `cv.pullnorth.com/cvs/your-name-abc12`)

### For Pull North Administrators:
1. Access admin dashboard at [cv.pullnorth.com/admin](https://cv.pullnorth.com/admin)
2. Review submitted applications with completion tracking
3. Edit CV content using the enhanced interface
4. Use AI enhancement features:
   - **Individual field enhancement**: Click magic wand icons on specific fields
   - **Bulk enhancement**: Use "✨ AI Enhance" button to improve all fields at once
5. Publish CVs to generate professional URLs
6. Share CV links with students and employers

## 🤖 AI Enhancement Features

### Smart Content Improvement
- **Profile Summary**: Polishes grammar and professional language
- **Work Experience**: Improves clarity and maritime terminology
- **Skills Enhancement**: Optimizes skill descriptions for yacht crew industry
- **Professional Language**: Ensures industry-appropriate tone

### Conservative Enhancement Approach
- ✅ **Preserves all original content** and experiences
- ✅ **Focuses on grammar, clarity** and professional language
- ✅ **No exaggeration** or fictional additions
- ✅ **Maintains factual, professional tone**
- ✅ **Maritime industry optimization**
- ❌ **No emojis** or overly enthusiastic language
- ❌ **No made-up experiences** or qualifications

### User Experience
- **Progress Modal**: Shows step-by-step progress during bulk enhancement
- **Loading Indicators**: Visual feedback for individual field enhancements
- **Error Handling**: Graceful handling of API rate limits and failures
- **Toast Notifications**: Immediate feedback on successful operations

## 📊 Data Flow

```
Student Application → Admin Review → AI Enhancement → 
Professional URL Generation → Published CV → Employer Access
```

### Data Structure
- **Submissions**: `/data/submissions/[firstname-lastname-uniqueid].json`
- **Published CVs**: `/data/published/[uniqueid].json`
- **URL Mapping**: Dynamic slug mapping in `/pages/cvs/[slug].js`
- **Professional URLs**: `cv.pullnorth.com/cvs/[firstname-lastname-uniqueid]`

## 🔒 Security Features

- **Input validation** on all form fields
- **File upload restrictions** for profile pictures
- **XSS protection** with proper data sanitization
- **Admin authentication** with secure password protection
- **Environment variable protection** for API keys
- **Git security** with proper .gitignore configuration

## 🌐 Live Production Environment

### **Current Status**: ✅ **LIVE & OPERATIONAL**
- **Primary URL**: [cv.pullnorth.com](https://cv.pullnorth.com)
- **Application Form**: [cv.pullnorth.com/apply](https://cv.pullnorth.com/apply)
- **Admin Dashboard**: [cv.pullnorth.com/admin](https://cv.pullnorth.com/admin)
- **Published CVs**: `cv.pullnorth.com/cvs/[name]`

### **Deployment Details**
- **Platform**: Netlify
- **Repository**: [github.com/bucklemeshoe/cv-enhancer](https://github.com/bucklemeshoe/cv-enhancer)
- **Custom Domain**: cv.pullnorth.com (CNAME configured via GoDaddy)
- **SSL Certificate**: Automatic (provided by Netlify)
- **Build Command**: `npm run build`
- **Environment Variables**: Configured in Netlify dashboard

### **Performance & Scaling**
- **Current Capacity**: Optimized for 100-1,000 CVs
- **File-based Storage**: Efficient for current scale
- **No Database Required**: Cost-effective and maintenance-free
- **CDN Optimized**: Global content delivery via Netlify

## 🔧 Configuration

### **Admin Authentication**
- **Access**: [cv.pullnorth.com/admin](https://cv.pullnorth.com/admin)
- **Password**: Set in production environment
- **Security**: Password-protected admin access only

### **AI Enhancement Settings**
- **API Provider**: OpenAI GPT models
- **Enhancement Type**: Conservative, professional improvements
- **Industry Focus**: Maritime/yacht crew specialization
- **Rate Limiting**: Configured for optimal performance

### **URL Structure**
```javascript
// Format: firstname-lastname-uniqueid
const concatenatedSlug = `${firstName}-${lastName}-${uniqueId}`
// Example: cv.pullnorth.com/cvs/jared-smith-ja8r3
```

## 💡 Perfect For

### **Target Users**
- **Yacht crew candidates** seeking professional CV enhancement
- **Pull North training graduates** needing job-ready CVs
- **Maritime professionals** transitioning to yacht industry
- **International crew members** requiring professional English CVs

### **Use Cases**
- **Career development** with AI-assisted content improvement
- **Professional portfolio** creation for yacht crew
- **Recruitment support** with shareable professional URLs
- **Training program completion** certificates and CV enhancement

## 📈 Results & Benefits

This system delivers **enterprise-quality CV enhancement** specifically designed for the yacht crew industry:

✅ **Professional content improvement** with maritime industry expertise  
✅ **SEO-friendly URL structure** for better discoverability  
✅ **Mobile-responsive design** optimized for all devices  
✅ **Comprehensive admin tools** for efficient CV management  
✅ **Industry-specific optimization** for yacht crew positioning  
✅ **Cost-effective scaling** with file-based architecture  
✅ **Professional Pull North branding** throughout  

## 🎉 Success Metrics

The platform successfully helps yacht crew candidates present their experience professionally while giving Pull North administrators powerful tools to enhance and manage CV content efficiently, contributing to better job placement rates and professional development outcomes.

---

**Built with ❤️ by bucklemeshoe for Pull North Yachting**

*Production System - Last Updated: January 2025* 
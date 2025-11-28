# Feature Specification Document: Student CV Edit Page

## Overview
Create a student-facing CV edit page that reuses the admin edit interface components but with restricted functionality. Students can edit and save their CVs but cannot publish/unpublish or use AI enhancement features.

## Problem Statement
- Currently, clicking "Edit" on a CV from `/my-cvs` results in a 404 error
- No student-facing edit page exists
- Admin edit page (`/admin/edit/[id].js`) has all the functionality but includes admin-only features

## Solution Approach
**Reuse the admin edit page components** with a mode-based approach to conditionally show/hide features based on user role.

## Architecture

### Option 1: Shared Component with Mode Prop (Recommended)
Create a shared edit component that accepts a `mode` prop (`'admin'` | `'student'`) to conditionally render features.

**Structure:**
```
components/
  CVEditForm/
    index.js              # Main wrapper component
    FormFields.js         # All form fields (reusable)
    AdminFeatures.js      # Admin-only features (publish, enhance)
    StudentFeatures.js    # Student-only features (save, view)
```

**Pages:**
```
pages/
  admin/edit/[id].js      # Admin edit page (uses CVEditForm with mode='admin')
  my-cvs/[id]/edit.js     # Student edit page (uses CVEditForm with mode='student')
```

### Option 2: Duplicate with Conditional Rendering
Create a separate student edit page that duplicates the admin edit code but conditionally hides features.

**Pages:**
```
pages/
  admin/edit/[id].js      # Admin edit (full features)
  my-cvs/[id]/edit.js     # Student edit (restricted features)
```

**Pros:**
- Simpler initial implementation
- Clear separation of concerns
- Easier to customize student experience later

**Cons:**
- Code duplication
- Maintenance overhead (changes need to be made in two places)

## Recommended Implementation: Option 1 (Shared Component)

### File Structure
```
cv-builder/
├── components/
│   └── CVEditForm/
│       ├── index.js                    # Main component with mode prop
│       ├── FormFields.js              # All form input fields
│       ├── AdminToolbar.js            # Admin-only toolbar (publish, enhance)
│       ├── StudentToolbar.js          # Student-only toolbar (save, back)
│       └── hooks/
│           ├── useCVForm.js           # Shared form state management
│           ├── useCVSave.js           # Shared save functionality
│           └── useCVLoad.js           # Shared data loading
├── pages/
│   ├── admin/
│   │   └── edit/
│   │       └── [id].js                # Admin wrapper (mode='admin')
│   └── my-cvs/
│       └── [id]/
│           └── edit.js                 # Student wrapper (mode='student')
└── lib/
    └── cv-edit-utils.js               # Shared utilities
```

## Feature Restrictions

### Student Mode (`mode='student'`)
**Allowed:**
- ✅ View all CV fields
- ✅ Edit all CV fields
- ✅ Save changes (updates `student_data` in database)
- ✅ Upload/change profile picture
- ✅ Add/remove experience entries
- ✅ Add/remove certifications
- ✅ Add/remove education entries
- ✅ Add/remove references
- ✅ View CV status (pending/reviewed/published)
- ✅ Navigate back to "My CVs" page

**Restricted:**
- ❌ Publish/Unpublish CV button
- ❌ AI Enhance buttons (individual fields and "Enhance All")
- ❌ Show Badge toggle (admin-only feature)
- ❌ Access to admin dashboard
- ❌ Delete CV functionality

### Admin Mode (`mode='admin'`)
**Allowed:**
- ✅ All student features PLUS:
- ✅ Publish/Unpublish CV
- ✅ AI Enhance (individual fields and "Enhance All")
- ✅ Show Badge toggle
- ✅ Access to admin dashboard
- ✅ Delete CV functionality

## API Endpoints

### Existing Endpoints (Reusable)
1. **GET `/api/admin/get-submission?id={id}`**
   - Used by: Both admin and student
   - **Security:** Student version must verify `user_id` matches authenticated user
   - **Action:** Create student-specific endpoint or add auth check

2. **POST `/api/admin/update-submission`**
   - Used by: Both admin and student
   - **Security:** Student version must verify `user_id` matches authenticated user
   - **Action:** Add user verification middleware

### New Endpoints (If Needed)
1. **GET `/api/my-cvs/[id]`**
   - Purpose: Get single CV for authenticated student
   - Security: Verify `user_id` matches authenticated user via JWT
   - Returns: Same format as admin endpoint

2. **POST `/api/my-cvs/[id]/update`**
   - Purpose: Update CV for authenticated student
   - Security: Verify `user_id` matches authenticated user via JWT
   - Restrictions: Cannot update `status` or `enhanced_data`
   - Returns: Updated submission

## Implementation Steps

### Phase 1: Create Student Edit Page Route
1. Create `/pages/my-cvs/[id]/edit.js`
2. Add authentication check (redirect to login if not authenticated)
3. Verify CV ownership (check `user_id` matches authenticated user)
4. Load CV data using existing API (with auth check)

### Phase 2: Extract Shared Components
1. Create `components/CVEditForm/index.js` with mode prop
2. Move form fields to `components/CVEditForm/FormFields.js`
3. Extract admin features to `components/CVEditForm/AdminToolbar.js`
4. Create `components/CVEditForm/StudentToolbar.js`
5. Extract form state management to `hooks/useCVForm.js`
6. Extract save logic to `hooks/useCVSave.js`

### Phase 3: Update Admin Edit Page
1. Refactor `/pages/admin/edit/[id].js` to use `CVEditForm` component
2. Pass `mode='admin'` prop
3. Verify all admin features still work

### Phase 4: Implement Student Edit Page
1. Create `/pages/my-cvs/[id]/edit.js` using `CVEditForm` component
2. Pass `mode='student'` prop
3. Add authentication and ownership verification
4. Test all student-allowed features

### Phase 5: API Security Updates
1. Add user verification to `/api/admin/get-submission` (or create student endpoint)
2. Add user verification to `/api/admin/update-submission` (or create student endpoint)
3. Ensure students can only update their own CVs

### Phase 6: Testing
1. Test student can edit and save their CV
2. Test student cannot access publish/enhance features
3. Test student cannot edit other users' CVs
4. Test admin features still work correctly
5. Test unsaved changes warning
6. Test form validation

## Security Considerations

### Authentication
- Student must be authenticated (use `useAuth` hook)
- Verify JWT token on API requests

### Authorization
- Verify `submission.user_id === authenticated_user.id` before allowing edit
- Return 403 Forbidden if user tries to edit another user's CV
- Use Row Level Security (RLS) policies in Supabase as backup

### Data Protection
- Students cannot modify:
  - `status` field (cannot publish themselves)
  - `enhanced_data` field (admin-only AI enhancements)
  - `showBadge` field (admin-only feature)
- Students can only modify:
  - `student_data` field
  - `updated_at` timestamp (auto-updated)

## UI/UX Considerations

### Student Edit Page Header
```
[Pull North Logo] Edit My CV                    [Back to My CVs] [Save Changes]
```

### Admin Edit Page Header (Existing)
```
[Pull North Logo] Edit CV - {Name}              [Dashboard] [Save Changes] [Publish] [Enhance All]
```

### Visual Indicators
- Show CV status badge (pending/reviewed/published)
- Show "Unsaved changes" warning when applicable
- Disable/hide restricted features (don't just hide - prevent access)

### Navigation
- Student: Back button → `/my-cvs`
- Admin: Back button → `/admin`

## Data Flow

### Student Edit Flow
```
1. Student clicks "Edit" on /my-cvs
2. Navigate to /my-cvs/[id]/edit
3. Verify authentication & ownership
4. Load CV data from API (with user_id check)
5. Render CVEditForm with mode='student'
6. Student makes changes
7. Click "Save Changes"
8. POST to /api/admin/update-submission (with auth & ownership check)
9. Update student_data in database
10. If published, sync to published_cvs table
11. Show success message
12. Optionally redirect to /my-cvs
```

### Admin Edit Flow (Existing)
```
1. Admin clicks "Edit" on /admin
2. Navigate to /admin/edit/[id]
3. Verify admin authentication
4. Load CV data from API
5. Render CVEditForm with mode='admin'
6. Admin makes changes / uses AI enhance
7. Click "Save Changes" or "Publish"
8. POST to /api/admin/update-submission
9. Update student_data (and enhanced_data if enhanced)
10. If published, sync to published_cvs table
11. Show success message
12. Redirect to /admin
```

## API Security Implementation

### Option A: Add Auth Check to Existing Endpoints
Modify `/api/admin/get-submission.js` and `/api/admin/update-submission.js` to:
1. Check if request has student auth token
2. If student, verify `user_id` matches
3. If admin (service role), allow full access

### Option B: Create Student-Specific Endpoints
Create new endpoints:
- `/api/my-cvs/[id].js` - Get CV (with ownership check)
- `/api/my-cvs/[id]/update.js` - Update CV (with ownership check)

**Recommendation:** Option A (simpler, less duplication)

## Example Code Structure

### Student Edit Page (`/pages/my-cvs/[id]/edit.js`)
```javascript
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter } from 'next/router'
import CVEditForm from '../../../components/CVEditForm'

export default function StudentEditCV() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: authLoading } = useAuth()
  
  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push('/auth/login')
    return null
  }
  
  // Verify ownership and load data
  // ... ownership check logic ...
  
  return (
    <CVEditForm 
      submissionId={id}
      mode="student"
      onSaveSuccess={() => router.push('/my-cvs')}
      backUrl="/my-cvs"
    />
  )
}
```

### CVEditForm Component (`/components/CVEditForm/index.js`)
```javascript
export default function CVEditForm({ 
  submissionId, 
  mode = 'admin',
  onSaveSuccess,
  backUrl 
}) {
  const isAdmin = mode === 'admin'
  const isStudent = mode === 'student'
  
  // Shared form state and logic
  const { formData, loading, handleSave } = useCVForm(submissionId, mode)
  
  return (
    <div>
      {/* Header with mode-specific navigation */}
      <Header 
        mode={mode}
        backUrl={backUrl}
        onSave={handleSave}
      />
      
      {/* Form fields (shared) */}
      <FormFields 
        formData={formData}
        onChange={handleChange}
      />
      
      {/* Admin-only features */}
      {isAdmin && (
        <AdminToolbar 
          onPublish={handlePublish}
          onEnhance={handleEnhance}
        />
      )}
      
      {/* Student-only features */}
      {isStudent && (
        <StudentToolbar 
          onSave={handleSave}
        />
      )}
    </div>
  )
}
```

## Testing Checklist

- [ ] Student can access their own CV edit page
- [ ] Student cannot access other users' CV edit pages (403 error)
- [ ] Student can edit all CV fields
- [ ] Student can save changes successfully
- [ ] Student cannot see publish/unpublish buttons
- [ ] Student cannot see AI enhance buttons
- [ ] Student cannot see show badge toggle
- [ ] Unsaved changes warning works
- [ ] Form validation works
- [ ] Profile picture upload works
- [ ] Admin edit page still works with all features
- [ ] Published CVs auto-update when student saves changes
- [ ] Authentication redirects work correctly

## Future Enhancements

1. **Student View Mode**: Read-only view of published CV
2. **Change History**: Track who made what changes and when
3. **Draft System**: Allow students to save drafts without updating published CV
4. **Comments/Notes**: Allow admin to leave notes for students
5. **Email Notifications**: Notify student when admin publishes their CV

## Timeline Estimate

- **Phase 1:** 2-3 hours (Create route, basic page)
- **Phase 2:** 4-6 hours (Extract shared components)
- **Phase 3:** 2-3 hours (Update admin page)
- **Phase 4:** 3-4 hours (Implement student page)
- **Phase 5:** 2-3 hours (API security)
- **Phase 6:** 2-3 hours (Testing)

**Total:** 15-22 hours

## Notes

- This approach maximizes code reuse while maintaining clear separation of concerns
- The mode-based approach makes it easy to add new user roles in the future
- Shared components ensure consistency between admin and student experiences
- Security is critical - always verify ownership on both client and server side


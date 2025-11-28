import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { updatePassword } from '../../lib/auth'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseClient } from '../../lib/supabaseClient'

export default function ResetPassword() {
  const router = useRouter()
  const { user } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)

  // Check if we have a valid password reset token
  useEffect(() => {
    let subscription = null
    
    const checkToken = async () => {
      try {
        // Check URL hash for errors first
        const hash = window.location.hash
        const hashParams = new URLSearchParams(hash.substring(1))
        const error = hashParams.get('error')
        const errorCode = hashParams.get('error_code')
        const errorDescription = hashParams.get('error_description')
        
        console.log('Reset password - Full URL:', window.location.href)
        console.log('Reset password - Hash:', hash.substring(0, 200))
        
        // If there's an error in the hash, handle it
        if (error) {
          let errorMessage = 'Invalid or expired reset link.'
          
          if (errorCode === 'otp_expired') {
            errorMessage = 'This password reset link has expired. Please request a new one.'
          } else if (errorCode === 'access_denied') {
            errorMessage = 'Access denied. The reset link may have already been used or is invalid.'
          } else if (errorDescription) {
            errorMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          }
          
          setError(errorMessage)
          setIsValidToken(false)
          setCheckingToken(false)
          return
        }
        
        // Check URL hash for recovery token
        const type = hashParams.get('type')
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('Reset password - Hash params:', { 
          type, 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken
        })
        
        // If we have recovery tokens in the hash, allow the user to proceed
        // Supabase will process them automatically with detectSessionInUrl
        if (type === 'recovery' && (accessToken || refreshToken)) {
          console.log('Recovery tokens detected in hash - allowing password reset')
          // Set valid immediately - Supabase will process the hash
          setIsValidToken(true)
          setCheckingToken(false)
          return
        }
        
        // Listen for PASSWORD_RECOVERY event - this is the key event Supabase emits
        subscription = supabaseClient.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change event:', event, session ? 'has session' : 'no session')
          
          if (event === 'PASSWORD_RECOVERY') {
            console.log('PASSWORD_RECOVERY event detected!')
            setIsValidToken(true)
            setCheckingToken(false)
            return
          }
          
          // Also check if we got a session
          if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            console.log('Session found via auth state change')
            setIsValidToken(true)
            setCheckingToken(false)
            return
          }
        })
        
        // Give Supabase time to process the hash and emit events
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // After waiting, check if we have a session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
        
        console.log('Final session check:', { 
          hasSession: !!session, 
          sessionError: sessionError?.message,
          user: session?.user?.email
        })
        
        if (session && !sessionError) {
          console.log('Valid session found, allowing password reset')
          setIsValidToken(true)
        } else {
          // No session and no recovery tokens
          setError('Invalid or expired reset link. Please request a new password reset.')
          setIsValidToken(false)
        }
      } catch (err) {
        console.error('Error validating reset link:', err)
        setError('Error validating reset link. Please request a new password reset.')
        setIsValidToken(false)
      } finally {
        setCheckingToken(false)
      }
    }

    checkToken()
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription?.data?.subscription) {
        subscription.data.subscription.unsubscribe()
      }
    }
  }, [])

  // Redirect if already logged in (not in password reset flow)
  useEffect(() => {
    if (user && user.email_confirmed_at) {
      router.push('/my-cvs')
    }
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await updatePassword(password)

      if (updateError) {
        setError(updateError.message || 'Failed to update password')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Validating reset link...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Invalid Reset Link
          </h2>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push('/auth/forgot-password')}
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Request New Reset Link
                  </button>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="space-y-6">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Password updated successfully!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      Redirecting to sign in...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating password...' : 'Update password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


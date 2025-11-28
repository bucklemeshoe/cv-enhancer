import { supabaseClient } from './supabaseClient'

/**
 * Authentication helpers for user account management
 */

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} firstName - User first name
 * @param {string} lastName - User last name
 * @returns {Promise<{user, error}>} User object and any error
 */
export async function signUp(email, password, firstName, lastName) {
  try {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
    const fullName = `${firstName} ${lastName}`.trim()
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          firstName: firstName || '',
          lastName: lastName || '',
          name: fullName,
          full_name: fullName
        }
      }
    })
    return { user: data.user, error }
  } catch (error) {
    return { user: null, error }
  }
}

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user, error}>} User object and any error
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })
    return { user: data.user, error }
  } catch (error) {
    return { user: null, error }
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{error}>} Any error
 */
export async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut()
    return { error }
  } catch (error) {
    return { error }
  }
}

/**
 * Get the current authenticated user session
 * @returns {Promise<{user, session}>} User and session objects
 */
export async function getCurrentUser() {
  try {
    const { data: { user, session }, error } = await supabaseClient.auth.getSession()
    return { user, session, error }
  } catch (error) {
    return { user: null, session: null, error }
  }
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function with (user, session)
 * @returns {Object} Object with data.subscription property containing unsubscribe method
 */
export function onAuthStateChange(callback) {
  const result = supabaseClient.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null, session)
  })
  
  // Supabase returns { data: { subscription } }
  return result
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<{error}>} Any error
 */
export async function resetPassword(email) {
  try {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : undefined
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo
    })
    return { error }
  } catch (error) {
    return { error }
  }
}

/**
 * Update user password (after reset flow)
 * @param {string} newPassword - New password
 * @returns {Promise<{error}>} Any error
 */
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword
    })
    return { error }
  } catch (error) {
    return { error }
  }
}

/**
 * Resend email confirmation
 * @param {string} email - User email
 * @returns {Promise<{error}>} Any error
 */
export async function resendConfirmation(email) {
  try {
    const { error } = await supabaseClient.auth.resend({
      type: 'signup',
      email
    })
    return { error }
  } catch (error) {
    return { error }
  }
}


import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseClient } from '../../lib/supabaseClient'

const navigation = [
  { name: 'My CVs', href: '/my-cvs', current: true },
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

const statuses = {
  pending: 'text-yellow-700 bg-yellow-50 ring-yellow-600/20',
  reviewed: 'text-blue-600 bg-blue-50 ring-blue-500/10',
  published: 'text-green-700 bg-green-50 ring-green-600/20',
}

export default function MyCVs() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Load user's submissions
  useEffect(() => {
    if (user) {
      loadSubmissions()
    }
  }, [user])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      
      // Get auth token
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      // Fetch user's submissions from API
      const response = await fetch('/api/my-cvs', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      } else {
        setError('Failed to load submissions')
      }
    } catch (err) {
      console.error('Error loading submissions:', err)
      setError('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { signOut } = await import('../../lib/auth')
      await signOut()
      router.push('/')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>My CVs - Professional Yacht Crew CVs</title>
        <meta name="description" content="Manage your CV submissions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico?v=4" />
      </Head>

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
                <Link href="/apply">
                  <button className="mr-4 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors">
                    Create New CV
                  </button>
                </Link>
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
                <Link href="/apply" className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                  Create New CV
                </Link>
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
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-600">Loading your CVs...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No CVs yet</h2>
              <p className="text-gray-600 mb-6">Create your first professional CV to get started.</p>
              <Link href="/apply">
                <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl">
                  Create Your CV
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.student_data.firstName} {submission.student_data.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {submission.student_data.targetRole}
                      </p>
                    </div>
                    <span
                      className={classNames(
                        statuses[submission.status] || statuses.pending,
                        'rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
                      )}
                    >
                      {submission.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                  </div>

                  <div className="flex space-x-2">
                    {submission.status === 'published' && (
                      <Link href={`/cvs/${submission.published_slug}`} className="flex-1" target="_blank" rel="noopener noreferrer">
                        <button className="w-full px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">
                          View
                        </button>
                      </Link>
                    )}
                    <Link href={`/my-cvs/${submission.id}/edit`} className="flex-1">
                      <button className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                        Edit
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}


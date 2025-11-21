'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

const CURRENT_USER_ID = 1

type ProfileResponse = {
  name: string | null
  email: string | null
}

type FormErrors = {
  name?: string
  email?: string
}

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [initialProfile, setInitialProfile] = useState<ProfileResponse | null>(
    null
  )
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`/api/user/${CURRENT_USER_ID}`)

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const user: ProfileResponse = await response.json()
        const nextName = user.name ?? ''
        const nextEmail = user.email ?? ''

        setName(nextName)
        setEmail(nextEmail)
        setInitialProfile(user)
      } catch (error) {
        console.error(error)
        setMessage('Could not load profile information. Please try again later.')
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const hasChanges = useMemo(() => {
    if (!initialProfile) return false
    return (
      name.trim() !== (initialProfile.name ?? '').trim() ||
      email.trim() !== (initialProfile.email ?? '').trim()
    )
  }, [email, initialProfile, name])

  const validate = () => {
    const nextErrors: FormErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Name is required'
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsError(false)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/user/${CURRENT_USER_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const updatedUser: ProfileResponse = await response.json()
      setInitialProfile(updatedUser)
      setMessage('Profile updated successfully!')
    } catch (error) {
      console.error(error)
      setMessage('Unable to save your changes. Please try again.')
      setIsError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner className="size-5" />
          <span>Loading profile…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-10">
      <Card className="w-full border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="text-2xl">Profile settings</CardTitle>
          <CardDescription>
            Update the information that will be associated with your sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(errors.name)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <p
                role="status"
                className={`text-sm ${
                  isError ? 'text-destructive' : 'text-muted-foreground'
                }`}
              >
                {message}
              </p>
              <Button
                type="submit"
                disabled={isSubmitting || !hasChanges}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
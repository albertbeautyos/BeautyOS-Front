'use client'

import React, { useState } from 'react';
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import beautyos from '@/public/assets/beautyos.png'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handler for the first step: Requesting the code
  const handleSendCodeRequest = async (emailOrPhone: string) => {
    setError(null)
    setIsLoading(true)
    console.log('Requesting verification code for:', emailOrPhone)

    try {
      // --- Add your code sending logic here ---
      // Example: Call an API to send an SMS or email
      // const response = await fetch('/api/send-code', { method: 'POST', body: JSON.stringify({ emailOrPhone }) });
      // if (!response.ok) throw new Error('Failed to send code');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('Code sent successfully (simulation)')
      // No navigation needed here, LoginForm handles showing the code input

    } catch (err) {
      console.error("Send code error:", err)
      setError(err instanceof Error ? err.message : 'Failed to send verification code. Please try again.')
      // Re-throw or handle specific error states if needed to prevent moving to next step in form
      throw err // Re-throwing stops the form moving to verification step on error
    } finally {
      setIsLoading(false)
    }
  }

  // Renamed handler for the final step: Verifying code and logging in
  const handleVerifyAndLogin = async (data: { emailOrPhone: string; verificationCode: string }) => {
    setError(null)
    setIsLoading(true)
    console.log('Verifying code and logging in with:', data)

    try {
      // --- Add your verification and login logic here ---
      // Example: Call an API to verify the code and log the user in
      // const response = await fetch('/api/verify-login', { method: 'POST', body: JSON.stringify(data) });
      // if (!response.ok) throw new Error('Verification or login failed');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('Verification & Login successful (simulation)')
      document.cookie = "auth_token=dummy-token; path=/; max-age=86400"
      router.push('/dashboard')
    } catch (err) {
        console.error("Verification/Login error:", err)
        setError(err instanceof Error ? err.message : 'Invalid code or login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Placeholder Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)
    console.log('Google Sign-In initiated')
    try {
        // --- Add your Google Sign-In logic here ---
        // Example: Use a library like next-auth or firebase auth

        // Simulate Google Sign-In delay
         await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('Google Sign-In successful (simulation)')
        document.cookie = "auth_token=dummy-google-token; path=/; max-age=86400"
        router.push('/dashboard')
    } catch (err) {
        console.error("Google Sign-In error:", err)
        setError(err instanceof Error ? err.message : 'Google Sign-In failed. Please try again.')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-svh">
      {/* Header - Improved with smaller height and subtle styling */}
      <header className="border-b border-border/30 w-full bg-background/95 backdrop-blur-sm">
        <div className=" w-100%  flex h-14 items-center justify-between  p-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
                src={beautyos}
                alt="BeautyOS Logo"
                width={100}
                height={60}
                priority
              />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content - Use LoginForm with new props */}
      <div className="flex-1 flex items-center justify-center py-6 px-4">
        <div className="w-full max-w-md space-y-6">
           {/* Display general error message */}
           {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-md">
              {error}
            </div>
           )}
           <LoginForm
             onSendCodeRequest={handleSendCodeRequest}
             onSubmit={handleVerifyAndLogin}
             onGoogleSignIn={handleGoogleSignIn}
             isLoading={isLoading}
            />
        </div>
      </div>

      {/* Footer - Optional */}
      <footer className="py-4 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BeatyOS. All rights reserved.
      </footer>
    </div>
  )
}

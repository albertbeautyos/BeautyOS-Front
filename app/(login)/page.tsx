'use client'

import React from 'react';
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import beautyos from '@/public/assets/beautyos.png'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  const router = useRouter()

  // Handler for successful login notified by the LoginForm
  const handleLoginSuccess = (userId: string) => {
    console.log("Login successful in parent page! User ID:", userId);
    // Perform actions after successful login, like setting cookies or redirecting
    // Example: Set a dummy cookie (real logic might involve setting HttpOnly cookie via backend response)
    document.cookie = "auth_session=true; path=/; max-age=86400"; // Simple indicator
    router.push('/dashboard');
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

      {/* Main Content - Render LoginForm and pass onLoginSuccess */}
      <div className="flex-1 flex items-center justify-center py-6 px-4">
        <div className="w-full max-w-md space-y-6">
           {/* Error display is now handled within LoginForm */}
           <LoginForm
             onLoginSuccess={handleLoginSuccess}
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

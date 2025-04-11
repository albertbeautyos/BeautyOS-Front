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



  return (
    <div className="flex flex-col min-h-svh">
      <header className="border-b border-border/30 w-full bg-background/95 backdrop-blur-sm">
        <div className="w-full flex h-14 items-center justify-end p-3">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-6 px-4">
        <div className="w-full max-w-md space-y-6">
           <div className="flex justify-center">
               <Link href="/" className="flex items-center gap-2">
                <Image
                    src={beautyos}
                    alt="BeautyOS Logo"
                    width={200}
                    height={100}
                    priority
                />
              </Link>
           </div>
           <LoginForm/>
        </div>
      </div>

      <footer className="py-4 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BeatyOS. All rights reserved.
      </footer>
    </div>
  )
}

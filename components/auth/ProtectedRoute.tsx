// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/hooks/useAuth';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   fallbackUrl?: string; // URL to redirect to if not authenticated
// }

// /**
//  * Component to protect routes that require authentication
//  * Redirects to login page if user is not authenticated
//  */
// export default function ProtectedRoute({
//   children,
//   fallbackUrl = '/login'
// }: ProtectedRouteProps) {
//   const { isAuthenticated, isLoading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     // If not loading and not authenticated, redirect to login
//     if (!isLoading && !isAuthenticated) {
//       router.push(fallbackUrl);
//     }
//   }, [isLoading, isAuthenticated, router, fallbackUrl]);

//   // Show loading state
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // Show nothing while redirecting
//   if (!isAuthenticated) {
//     return null;
//   }

//   // Show children if authenticated
//   return <>{children}</>;
// }
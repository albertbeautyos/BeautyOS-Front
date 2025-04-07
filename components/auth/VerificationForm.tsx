'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerificationForm() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL query parameters
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);

      // In a real application, you would verify this code with your backend
      const storedCode = sessionStorage.getItem('verificationCode');

      if (code === storedCode) {
        // Successfully verified
        // Clear the verification code from storage
        sessionStorage.removeItem('verificationCode');

        // In a real app, you would create a session or token here
        sessionStorage.setItem('isAuthenticated', 'true');

        // Redirect to dashboard or home page
        router.push('/dashboard');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">Verification</h2>

      <p className="text-center text-gray-600 mb-6">
        {email ? (
          <>We sent a verification code to <span className="font-medium">{email}</span></>
        ) : (
          <>Enter the verification code sent to your email</>
        )}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter 6-digit code"
            maxLength={6}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          className="text-sm text-blue-600 hover:underline"
          onClick={() => {
            // In a real application, this would trigger sending a new verification code
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            sessionStorage.setItem('verificationCode', newCode);
            console.log(`New verification code: ${newCode} would be sent to user's email`);
          }}
        >
          Resend Code
        </button>
      </div>
    </div>
  );
}
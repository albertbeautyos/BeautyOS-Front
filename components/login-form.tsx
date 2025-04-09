import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import axios, { AxiosError } from 'axios';
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { LocalStorageManager } from "@/helpers/localStorageManager";
import { sendLoginCode, verifyOtpAndLogin } from "@/services/auth";
import { useAppDispatch } from "@/store/hooks";
import { verifyOtpThunk } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

interface ApiErrorResponse {
   message: string;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.message || axiosError.message || `Request failed (${axiosError.response?.status || 'unknown status'})`;
  } else if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred.';
}

  interface LoginFormProps extends Omit<React.ComponentProps<"form">, 'onSubmit'> {
    onLoginSuccess?: (userId: string) => void;
}

const emailRegex = /^\w[\w-\.]*@([\w-]+\.)+[\w-]{2,4}$/;
const phoneRegex = /^(\+?1[.\-\s]?)?(\(?\d{3}\)?[.\-\s]?)?\d{3}[.\-\s]?\d{4}$/;
const verificationCodeRegex = /^\d{4}$/;

export function LoginForm({
  className,
  ...props
}: LoginFormProps) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState<{ emailOrPhone?: string; verificationCode?: string; api?: string }>({});
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttemptId, setLoginAttemptId] = useState<string | null>(null);
  const dispatch =useAppDispatch()
  const router = useRouter()

  const validateField = (name: string, value: string): boolean => {
    let error: string | undefined;
    if (name === "emailOrPhone") {
      if (!value) {
        error = "Email or Phone Number is required.";
      } else if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        error = "Please enter a valid email or phone number.";
      }
    } else if (name === "verificationCode") {
      if (!value) {
        error = "Verification code is required.";
      } else if (!verificationCodeRegex.test(value)) {
        error = "Code must be exactly 4 digits.";
      }
    }
    setErrors((prev) => ({ ...prev, api: undefined, [name]: error }));
    return !error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "emailOrPhone") {
      setEmailOrPhone(value);
    } else if (name === "verificationCode") {
      setVerificationCode(value.replace(/\D/g, '').slice(0, 4));
    }
    setErrors((prev) => ({ ...prev, api: undefined, [name]: undefined }));
  };

  const handleSendCode = async () => {
    if (!validateField("emailOrPhone", emailOrPhone)) return;

    setIsLoading(true);
    setErrors({});
    setLoginAttemptId(null);

    try {
      const receivedId = await sendLoginCode(emailOrPhone);
      setLoginAttemptId(receivedId);
      setIsVerificationStep(true);
    } catch (error) {
      setErrors({ api: getErrorMessage(error) });
      setIsVerificationStep(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndLogin = async () => {
    if (!loginAttemptId) {
       setErrors({ api: "Login session ID is missing. Please try sending the code again." });
       return;
    }
    if (!validateField("verificationCode", verificationCode)) return;

    const currentLoginId = loginAttemptId;

    setIsLoading(true);
    setErrors({});

    try {
     dispatch(verifyOtpThunk({ loginAttemptId: currentLoginId, otp: verificationCode, rememberMe }))
     router.push('/dashboard')
    } catch (error) {
      setErrors({ api: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isVerificationStep) {
      handleVerifyAndLogin();
    } else {
      handleSendCode();
    }
  };

  const handleGoBack = () => {
    setIsVerificationStep(false);
    setVerificationCode("");
    setErrors({});
    setLoginAttemptId(null);
  };

   const handleGoogleSignInClick = async () => {
        setIsLoading(true);
        setErrors({});
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const simulatedUserId = "google-user-" + Math.random().toString(36).substring(7);
        } catch (error) {
            setErrors({ api: getErrorMessage(error) });
        } finally {
            setIsLoading(false);
        }
   };


  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
         <h1 className="text-2xl font-bold">Login to your account</h1>
         <p className="text-muted-foreground text-sm text-balance">
            {isVerificationStep
              ? `Enter the code sent to ${emailOrPhone}`
              : "Enter your email or phone to receive a code"
            }
         </p>
       </div>

       {errors.api && (
         <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-md">
             {errors.api}
         </div>
       )}


      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <div className="flex justify-between items-center">
             <Label htmlFor="emailOrPhone">Email or Phone Number</Label>
             {isVerificationStep && (
                 <Button variant="link" type="button" onClick={handleGoBack} className="h-auto p-0 text-xs" disabled={isLoading}>
                     Change
                 </Button>
             )}
          </div>
          <Input
            id="emailOrPhone"
            name="emailOrPhone"
            type="text"
            placeholder="your@email.com or 123-456-7890"
            required
            value={emailOrPhone}
            onChange={handleInputChange}
            disabled={isLoading || isVerificationStep}
            aria-invalid={!!errors.emailOrPhone}
            aria-describedby="emailOrPhone-error"
          />
          {errors.emailOrPhone && !isVerificationStep && (
             <p id="emailOrPhone-error" className="text-xs text-red-600">{errors.emailOrPhone}</p>
          )}
        </div>

        {isVerificationStep && (
          <>
            <div className="grid gap-1.5">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                name="verificationCode"
                type="text"
                inputMode="numeric"
                required
                maxLength={4}
                placeholder="1234"
                value={verificationCode}
                onChange={handleInputChange}
                disabled={isLoading}
                aria-invalid={!!errors.verificationCode}
                aria-describedby="verificationCode-error"
              />
              {errors.verificationCode && <p id="verificationCode-error" className="text-xs text-red-600">{errors.verificationCode}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                disabled={isLoading}
               />
              <label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>

            <p className="px-0 text-center text-xs text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link
                href="/legal"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms and Privacy Policy
              </Link>
              .
            </p>
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            : (isVerificationStep ? "Verify & Sign In" : "Send Code")
          }
        </Button>

        <div className="relative">
           <div className="absolute inset-0 flex items-center">
             <span className="w-full border-t"></span>
           </div>
           <div className="relative flex justify-center text-xs uppercase">
             <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
           </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignInClick} disabled={isLoading} type="button">
           {isLoading ? (
             <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
           ) : (
             <Icons.google className="mr-2 h-4 w-4" />
           )}
           Login with Google
        </Button>
      </div>
    </form>
  );
}

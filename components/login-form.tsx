import React, { useState } from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"

interface LoginFormProps extends Omit<React.ComponentProps<"form">, 'onSubmit'> {
  onSendCodeRequest: (emailOrPhone: string) => Promise<void> | void;
  onSubmit: (data: { emailOrPhone: string; verificationCode: string }) => Promise<void> | void;
  onGoogleSignIn: () => Promise<void> | void;
  isLoading?: boolean;
}

const emailRegex = /^\w[\w-\.]*@([\w-]+\.)+[\w-]{2,4}$/;
const phoneRegex = /^[\+\d]?(\s*\(?\d{3}\)?\s*[-\.\s]?)?\d{3}[-\.\s]?\d{4}$/;
const verificationCodeRegex = /^\d{4}$/;

export function LoginForm({
  className,
  onSendCodeRequest,
  onSubmit,
  onGoogleSignIn,
  isLoading = false,
  ...props
}: LoginFormProps) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState<{ emailOrPhone?: string; verificationCode?: string }>({});
  const [isVerificationStep, setIsVerificationStep] = useState(false);

  const validateField = (name: string, value: string) => {
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
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "emailOrPhone") {
      setEmailOrPhone(value);
    } else if (name === "verificationCode") {
      setVerificationCode(value.replace(/D/g, '').slice(0, 4));
    }
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isVerificationStep) {
      if (validateField("emailOrPhone", emailOrPhone)) {
        onSendCodeRequest(emailOrPhone);
        setIsVerificationStep(true);
        setErrors({});
      }
    } else {
      if (validateField("verificationCode", verificationCode)) {
        onSubmit({ emailOrPhone, verificationCode });
      }
    }
  };

  const handleGoBack = () => {
    setIsVerificationStep(false);
    setVerificationCode("");
    setErrors({});
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
        <Button variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={isLoading} type="button">
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Login with Google
        </Button>
      </div>
    </form>
  )
}

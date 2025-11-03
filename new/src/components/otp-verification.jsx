import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authAPI } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

export function OTPVerification({
  className,
  email,
  onVerified,
  onResend,
  developmentOTP,
  password, // New prop to receive password
  ...props
}) {
  const [otp, setOtp] = useState(developmentOTP || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Update OTP if developmentOTP is provided
  useEffect(() => {
    if (developmentOTP) {
      setOtp(developmentOTP)
    }
  }, [developmentOTP])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "OTP must be 6 digits",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.verifyOTP(email, otp, password)
      
      toast({
        title: "Account created successfully",
        description: "Welcome to Skill Sync!",
      })
      
      if (onVerified) {
        onVerified(response.user)
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      const response = await authAPI.resendOTP(email)
      
      // Check if OTP is returned (development mode)
      if (response.otp) {
        setOtp(response.otp)
        toast({
          title: "OTP Regenerated (Development Mode)",
          description: `Your new OTP is: ${response.otp}`,
          duration: 10000,
        })
      } else {
        toast({
          title: "OTP resent",
          description: "Check your email for the new code",
        })
      }
      
      if (onResend) {
        onResend()
      }
    } catch (error) {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Verify your email</h1>
                <p className="text-muted-foreground text-balance">
                  Enter the 6-digit code sent to {email}
                </p>
                {developmentOTP && (
                  <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-200">
                    Development Mode: OTP auto-filled (email not configured)
                  </div>
                )}
              </div>
              <Field>
                <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
                <Input 
                  id="otp" 
                  type="text" 
                  placeholder="000000" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required 
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest"
                />
                <FieldDescription>
                  We sent a verification code to your email. Check your inbox.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  className="underline-offset-2 hover:underline"
                >
                  Resend
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


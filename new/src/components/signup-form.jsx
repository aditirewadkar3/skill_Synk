import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { authAPI } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { OTPVerification } from "@/components/otp-verification"

// Available user roles
const ROLES = [
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'investor', label: 'Investor' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'admin', label: 'Admin' }
];

export function SignupForm({
  className,
  onSignup,
  ...props
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [pendingOTP, setPendingOTP] = useState(null)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    if (!role) {
      toast({
        title: "Role required",
        description: "Please select a role",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.register(email, password, name || email.split('@')[0], role)
      
      // Check if OTP was returned (development mode)
      if (response.development && response.otp) {
        toast({
          title: "OTP Generated (Development Mode)",
          description: `Your OTP is: ${response.otp}. Email not configured.`,
          duration: 10000,
        })
        // Store OTP for auto-fill in development
        setPendingOTP(response.otp)
      } else {
        toast({
          title: "OTP sent",
          description: "Check your email for the verification code",
        })
      }
      
      setShowOTP(true)
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerified = (user) => {
    if (onSignup) {
      onSignup()
    }
  }

  if (showOTP) {
    return (
      <OTPVerification 
        email={email}
        password={password} // Pass password to OTP verification
        onVerified={handleOTPVerified}
        onResend={() => {
          // OTP will be resent in OTPVerification component
        }}
        developmentOTP={pendingOTP}
      />
    )
  }
  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to create your account
                </p>
              </div>
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
                <FieldDescription>
                  Your display name (optional)
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  disabled={isLoading}
                />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select your role</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 6 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Create Account"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <a href="/login">Sign in</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

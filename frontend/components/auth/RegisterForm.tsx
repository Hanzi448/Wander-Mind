import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/services/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GoogleSignInButton from '@/components/ui/GoogleSignInButton';
import { RegisterRequest } from '@/utils/types';
import { SUCCESS_MESSAGES, VALIDATION } from '@/utils/constants';

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'Contains uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Contains number', test: /\d/.test(password) },
    { label: 'Contains special character', test: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  
  const passed = checks.filter(check => check.test).length;
  return { checks, strength: passed };
};

// Validation schema
const registerSchema = z.object({
  username: z
    .string()
    .min(VALIDATION.USERNAME_MIN_LENGTH, `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, redirectTo }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  interface PasswordCheck {
    label: string;
    test: boolean;
  }
  
  const [passwordStrength, setPasswordStrength] = useState<{ checks: PasswordCheck[]; strength: number }>({
    checks: [],
    strength: 0,
  });
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch('password', '');

  // Update password strength on password change
  React.useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength(checkPasswordStrength(watchedPassword));
    }
  }, [watchedPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData as RegisterRequest);
      
      toast.success(SUCCESS_MESSAGES.REGISTER);
      
      if (onSuccess) {
        onSuccess();
      } else {
        const returnUrl = redirectTo || '/dashboard';
        router.push(returnUrl);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different error types
      if (error.message.includes('username')) {
        setError('username', { message: error.message });
      } else if (error.message.includes('email')) {
        setError('email', { message: error.message });
      } else if (error.message.includes('password')) {
        setError('password', { message: error.message });
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  const isFormLoading = isLoading || isSubmitting;
  const getStrengthColor = (strength: number) => {
    if (strength < 2) return 'text-red-500';
    if (strength < 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join WanderMind
          </h1>
          <p className="text-gray-600">
            Create your account and start exploring
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            {...register('username')}
            type="text"
            label="Username"
            placeholder="Choose a username"
            icon={User}
            error={errors.username?.message}
            disabled={isFormLoading}
            fullWidth
          />

          <Input
            {...register('email')}
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            icon={Mail}
            error={errors.email?.message}
            disabled={isFormLoading}
            fullWidth
          />

          <div className="space-y-2">
            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a strong password"
                icon={Lock}
                error={errors.password?.message}
                disabled={isFormLoading}
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isFormLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {watchedPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Password strength:</span>
                  <span className={`text-xs font-medium ${getStrengthColor(passwordStrength.strength)}`}>
                    {getStrengthText(passwordStrength.strength)}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded ${
                        i < passwordStrength.strength 
                          ? passwordStrength.strength < 2 ? 'bg-red-500' 
                            : passwordStrength.strength < 4 ? 'bg-yellow-500' 
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="space-y-1">
                  {passwordStrength.checks.map((check, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      {check.test ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-gray-300" />
                      )}
                      <span className={check.test ? 'text-green-600' : 'text-gray-400'}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="Confirm your password"
              icon={Lock}
              error={errors.confirmPassword?.message}
              disabled={isFormLoading}
              fullWidth
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isFormLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4 mt-0.5"
              disabled={isFormLoading}
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-500 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-500 font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isFormLoading}
            fullWidth
            className="mt-6"
          >
            {isFormLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-8 flex items-center">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Google Sign Up */}
        <div className="flex justify-center">
          <GoogleSignInButton
            text="signup_with"
            disabled={isFormLoading}
            onSuccess={() => {
              if (onSuccess) {
                onSuccess();
              } else {
                const returnUrl = redirectTo || '/dashboard';
                router.push(returnUrl);
              }
            }}
            onError={(error) => {
              toast.error(error);
            }}
          />
        </div>

        {/* Sign In Link */}
        <p className="mt-8 text-center text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
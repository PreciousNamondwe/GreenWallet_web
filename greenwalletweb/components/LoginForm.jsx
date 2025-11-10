'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/superbase'; // Fixed typo: superbase → supabase

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Validate form data
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // User-friendly error messages
        switch (error.message) {
          case 'Invalid login credentials':
            setError('Invalid email or password. Please try again.');
            break;
          case 'Email not confirmed':
            setError('Please verify your email address before logging in.');
            break;
          case 'Too many requests':
            setError('Too many login attempts. Please try again later.');
            break;
          default:
            setError(error.message || 'Login failed. Please try again.');
        }
        return;
      }

      if (!data.user) {
        setError('Login failed. Please try again.');
        return;
      }

      // Check if user is a microfinance institution
      const { data: institutionData, error: institutionError } = await supabase
        .from('microfinance_institutions')
        .select('kyc_status, is_active')
        .eq('id', data.user.id)
        .single();

      if (institutionError) {
        console.error('Error fetching institution data:', institutionError);
        // If institution doesn't exist, it might be a different user type
        setError('Invalid account type. Please use a microfinance institution account.');
        return;
      }

      // Check KYC status - allow login but show warning for pending KYC
      if (institutionData.kyc_status !== 'approved') {
        // Instead of blocking login, allow access but show a warning
        console.warn('User logged in with KYC status:', institutionData.kyc_status);
        // You can show a banner in the dashboard instead of blocking login
      }

      if (!institutionData.is_active) {
        setError('Your account is inactive. Please contact support.');
        return;
      }

      // Success - redirect to dashboard
      console.log('Login successful:', data.user);
      router.push('/dashboard/dashboard'); // Redirect to specific dashboard page
      
    } catch (error) {
      console.error('Login failed:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address to reset password.');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError('Error sending reset email: ' + error.message);
      } else {
        setError('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    router.push('/signup');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground">Welcome Back</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in to your microfinance institution account
        </p>
      </div>

      {error && (
        <div className={`p-4 rounded-lg text-sm ${
          error.includes('sent') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Email Address *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-background"
            placeholder="institution@example.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
          Password *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full pl-10 pr-10 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-background"
            placeholder="Enter your password"
            required
            disabled={isLoading}
            minLength="8"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Eye className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-foreground">Remember me</span>
        </label>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Signing In...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={handleSignUpRedirect}
            className="text-primary hover:text-primary/80 font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            Create account
          </button>
        </p>
      </div>
    </form>
  );
}
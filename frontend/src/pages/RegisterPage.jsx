import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Store, Lock, Mail, User, MapPin, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMsg('');
    try {
      await registerUser({
        name: data.name.trim(),
        email: data.email.trim(),
        address: data.address.trim(),
        password: data.password,
        role: 'USER',
      });

      setSuccessMsg('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/user/dashboard');
      }, 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Store className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Create an Account
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-gray-600">
          Sign up as a normal user to discover and review stores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-gray-100">
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name (20–60 characters)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Jonathan Alexander Sterling"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                    errors.name
                      ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 20,
                      message: 'Name must be at least 20 characters long',
                    },
                    maxLength: {
                      value: 60,
                      message: 'Name cannot exceed 60 characters',
                    },
                  })}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                    errors.email
                      ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Address (Max 400 characters)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  placeholder="e.g. Flat 4B, Emerald Heights, Sector 12, New Delhi"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all resize-none ${
                    errors.address
                      ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                  {...register('address', {
                    required: 'Address is required',
                    maxLength: {
                      value: 400,
                      message: 'Address cannot exceed 400 characters',
                    },
                  })}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password (8–16 characters, 1 uppercase, 1 special character)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                    errors.password
                      ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters long',
                    },
                    maxLength: {
                      value: 16,
                      message: 'Password cannot exceed 16 characters',
                    },
                    validate: {
                      hasUppercase: (val) =>
                        /[A-Z]/.test(val) || 'Must contain at least one uppercase letter',
                      hasSpecial: (val) =>
                        /[!@#$%^&*(),.?":{}|<>]/.test(val) ||
                        'Must contain at least one special character',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === passwordValue || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                'Creating Account...'
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Store, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, User, Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await login(data);
      if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'STORE_OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid credentials or server error');
    }
  };

  const handleQuickFill = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    setServerError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Store className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome to StorePulse
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-gray-600">
          Sign in to your account to browse, rate, or manage stores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-gray-100">
          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
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
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Helper */}
          {/* <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-center font-medium text-gray-500 mb-3">
              Quick Demo Accounts (Click to Autofill)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@storerating.com', 'Password@12345')}
                className="p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('owner@storerating.com', 'Password@12345')}
                className="p-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-800 text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Owner</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('user@storerating.com', 'Password@12345')}
                className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-800 text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>User</span>
              </button>
            </div>
          </div> */}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

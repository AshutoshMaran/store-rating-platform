import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { X, Key, CheckCircle, AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ onClose }) {
  const { updatePassword } = useAuth();
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMsg('');
    try {
      await updatePassword(data.newPassword);
      setSuccessMsg('Password updated successfully!');
      reset();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Update Password</h3>
            <p className="text-xs text-gray-500">Enter a secure new password for your account</p>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                errors.newPassword ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
              {...register('newPassword', {
                required: 'New password is required',
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
                    /[A-Z]/.test(val) || 'Password must include at least one uppercase letter',
                  hasSpecial: (val) =>
                    /[!@#$%^&*(),.?":{}|<>]/.test(val) ||
                    'Password must include at least one special character',
                },
              })}
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Re-enter new password"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                errors.confirmPassword ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (val) => val === newPassword || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Updating...' : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Store, LogOut, Key, UserCheck, ShieldCheck, Building2 } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Building2 className="w-3.5 h-3.5" /> Store Owner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <UserCheck className="w-3.5 h-3.5" /> User
          </span>
        );
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">StorePulse</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-gray-500 font-medium border-l pl-2 border-gray-200">
                Rating & Reviews Platform
              </span>
            </div>
          </div>

          {/* User Info & Actions */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>

              {getRoleBadge(user.role)}

              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                title="Change Password"
              >
                <Key className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">Change Password</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border border-red-200"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </>
  );
}

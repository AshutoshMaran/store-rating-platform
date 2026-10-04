import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar.jsx';
import { useForm } from 'react-hook-form';
import {
  getDashboardStatsApi,
  getAllUsersApi,
  getAllStoresApi,
  addUserApi,
  addStoreApi,
  assignStoreOwnerApi
} from '../api/admin.api.js';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  Building2,
  UserCheck,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Mail,
  MapPin,
  Lock,
  User
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'users'
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Filter & Sort States for Stores
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortField, setStoreSortField] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');

  // Filter & Sort States for Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSortField, setUserSortField] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');

  // Modals state
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [assignModalStore, setAssignModalStore] = useState(null);

  const loadAllData = async () => {
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const [statsRes, storesRes, usersRes] = await Promise.all([
        getDashboardStatsApi(),
        getAllStoresApi(),
        getAllUsersApi()
      ]);

      setStats(statsRes?.stats || { totalUsers: 0, totalStores: 0, totalRatings: 0 });
      setStores(storesRes?.stores || []);
      setUsers(usersRes?.users || []);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load administrator data.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter & Sort Stores
  const processedStores = useMemo(() => {
    let result = [...stores];

    if (storeSearch.trim()) {
      const q = storeSearch.toLowerCase();
      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.address && s.address.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let valA = a[storeSortField];
      let valB = b[storeSortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB ? valB.toLowerCase() : '';
      }

      if (valA < valB) return storeSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return storeSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [stores, storeSearch, storeSortField, storeSortOrder]);

  // Filter & Sort Users
  const processedUsers = useMemo(() => {
    let result = [...users];

    // Filter by Role
    if (userRoleFilter !== 'ALL') {
      result = result.filter((u) => u.role === userRoleFilter);
    }

    // Filter by search (Name, Email, Address)
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      result = result.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.address && u.address.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[userSortField];
      let valB = b[userSortField];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return userSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return userSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, userSearch, userRoleFilter, userSortField, userSortOrder]);

  const toggleStoreSort = (field) => {
    if (storeSortField === field) {
      setStoreSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setStoreSortField(field);
      setStoreSortOrder('asc');
    }
  };

  const toggleUserSort = (field) => {
    if (userSortField === field) {
      setUserSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setUserSortField(field);
      setUserSortOrder('asc');
    }
  };

  // Available Store Owners for Assignment
  const availableStoreOwners = useMemo(() => {
    return users.filter((u) => u.role === 'STORE_OWNER');
  }, [users]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              System Administration
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage stores, assign owners, add system users, and track platform metrics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Global Feedback message */}
        {feedback.message && (
          <div
            className={`mb-6 p-4 rounded-2xl border text-sm flex items-center gap-3 ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 3 Metric Cards Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Users
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
                {stats.totalUsers}
              </h3>
            </div>
          </div>

          {/* Total Stores */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Stores
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
                {stats.totalStores}
              </h3>
            </div>
          </div>

          {/* Total Submitted Ratings */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Submitted Ratings
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
                {stats.totalRatings}
              </h3>
            </div>
          </div>
        </div>

        {/* Tab Controls & Add Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stores'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Stores ({stores.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Users ({users.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'stores' ? (
              <button
                onClick={() => setIsAddStoreOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Store</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Stores Management */}
        {activeTab === 'stores' && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            {/* Search Bar for Stores */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter stores by Name, Email, or Address..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="text-xs text-gray-500 font-medium">
                Showing {processedStores.length} of {stores.length} stores
              </div>
            </div>

            {/* Stores Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <th
                      onClick={() => toggleStoreSort('name')}
                      className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Store Name</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleStoreSort('email')}
                      className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Email</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleStoreSort('address')}
                      className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Address</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleStoreSort('overallRating')}
                      className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Overall Rating</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th className="py-3.5 px-6">Assigned Owner</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {processedStores.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-400">
                        No stores found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    processedStores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-900">{store.name}</td>
                        <td className="py-4 px-6 text-gray-600">{store.email}</td>
                        <td className="py-4 px-6 text-gray-600 max-w-xs truncate" title={store.address}>
                          {store.address}
                        </td>
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{store.overallRating > 0 ? store.overallRating : 'No ratings'}</span>
                            {store.totalRatings > 0 && (
                              <span className="text-[10px] text-gray-500 font-normal">
                                ({store.totalRatings})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {store.owner ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <Building2 className="w-3 h-3" />
                              {store.owner.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => setAssignModalStore(store)}
                            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Assign Owner
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
            {/* Filter and Search Bar for Users */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:max-w-xl">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter users by Name, Email, or Address..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                {/* Role Filter Selector */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="USER">Normal Users</option>
                    <option value="STORE_OWNER">Store Owners</option>
                    <option value="ADMIN">Administrators</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-gray-500 font-medium">
                Showing {processedUsers.length} of {users.length} users
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <th
                      onClick={() => toggleUserSort('name')}
                      className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Full Name</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleUserSort('email')}
                      className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Email</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleUserSort('address')}
                      className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Address</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleUserSort('role')}
                      className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Role</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleUserSort('storeRating')}
                      className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Store Rating</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {processedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-gray-400">
                        No users match the criteria.
                      </td>
                    </tr>
                  ) : (
                    processedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-900">{user.name}</td>
                        <td className="py-4 px-6 text-gray-600">{user.email}</td>
                        <td className="py-4 px-6 text-gray-600 max-w-xs truncate" title={user.address}>
                          {user.address}
                        </td>
                        <td className="py-4 px-6">
                          {user.role === 'ADMIN' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                              <ShieldCheck className="w-3.5 h-3.5" /> Admin
                            </span>
                          )}
                          {user.role === 'STORE_OWNER' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              <Building2 className="w-3.5 h-3.5" /> Store Owner
                            </span>
                          )}
                          {user.role === 'USER' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              <UserCheck className="w-3.5 h-3.5" /> Normal User
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {user.role === 'STORE_OWNER' ? (
                            user.storeRating !== null ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{user.storeRating > 0 ? user.storeRating : '0.0'} / 5</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">No ratings yet</span>
                            )
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Add New Store */}
      {isAddStoreOpen && (
        <AddStoreModal
          storeOwners={availableStoreOwners}
          onClose={() => setIsAddStoreOpen(false)}
          onSuccess={(newStore) => {
            setStores((prev) => [newStore, ...prev]);
            setStats((prev) => ({ ...prev, totalStores: prev.totalStores + 1 }));
            setFeedback({ type: 'success', message: 'Store added successfully!' });
            setIsAddStoreOpen(false);
          }}
        />
      )}

      {/* Modal: Add New User */}
      {isAddUserOpen && (
        <AddUserModal
          onClose={() => setIsAddUserOpen(false)}
          onSuccess={(newUser) => {
            setUsers((prev) => [newUser, ...prev]);
            setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
            setFeedback({ type: 'success', message: 'User created successfully!' });
            setIsAddUserOpen(false);
          }}
        />
      )}

      {/* Modal: Assign Store Owner */}
      {assignModalStore && (
        <AssignOwnerModal
          store={assignModalStore}
          storeOwners={availableStoreOwners}
          onClose={() => setAssignModalStore(null)}
          onSuccess={(updatedStore) => {
            setStores((prev) =>
              prev.map((s) => (s.id === updatedStore.id ? updatedStore : s))
            );
            setFeedback({ type: 'success', message: 'Store owner assigned successfully!' });
            setAssignModalStore(null);
          }}
        />
      )}
    </div>
  );
}

// Modal Component: Add New Store
function AddStoreModal({ storeOwners, onClose, onSuccess }) {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      address: '',
      ownerId: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        address: data.address.trim(),
        ownerId: data.ownerId || null,
      };
      const res = await addStoreApi(payload);
      onSuccess(res?.store);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to add store');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Add New Store</h3>
            <p className="text-xs text-gray-500">Register a new store on the platform</p>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              placeholder="e.g. Apex Electronics"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                errors.name ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
              }`}
              {...register('name', { required: 'Store name is required' })}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Store Email</label>
            <input
              type="email"
              placeholder="contact@store.com"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                errors.email ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
              }`}
              {...register('email', {
                required: 'Store email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Store Address (Max 400 characters)
            </label>
            <textarea
              rows={2}
              placeholder="Street, City, Postal Code"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all resize-none ${
                errors.address ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
              }`}
              {...register('address', {
                required: 'Store address is required',
                maxLength: {
                  value: 400,
                  message: 'Address cannot exceed 400 characters',
                },
              })}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Assign Store Owner (Optional)
            </label>
            <select
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              {...register('ownerId')}
            >
              <option value="">No owner assigned</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
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
              {isSubmitting ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component: Add New User
function AddUserModal({ onClose, onSuccess }) {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      address: '',
      password: '',
      role: 'USER',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        address: data.address.trim(),
        password: data.password,
        role: data.role,
      };
      const res = await addUserApi(payload);
      const createdUser = res.user || res.admin || res.storeOwner;
      onSuccess(createdUser);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to add user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Add New User</h3>
            <p className="text-xs text-gray-500">Create an Admin, Store Owner, or Normal User</p>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Name (20–60 characters)
            </label>
            <input
              type="text"
              placeholder="e.g. Jonathan Alexander Sterling"
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                errors.name ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
              }`}
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 20,
                  message: 'Name must be at least 20 characters',
                },
                maxLength: {
                  value: 60,
                  message: 'Name cannot exceed 60 characters',
                },
              })}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="user@example.com"
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                errors.email ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
              }`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">User Role</label>
            <select
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-medium"
              {...register('role')}
            >
              <option value="USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Address (Max 400 characters)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 742 Evergreen Terrace, Springfield"
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all resize-none ${
                errors.address ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
              }`}
              {...register('address', {
                required: 'Address is required',
                maxLength: {
                  value: 400,
                  message: 'Address cannot exceed 400 characters',
                },
              })}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password (8–16 chars, 1 uppercase, 1 special char)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none transition-all ${
                errors.password ? 'border-red-300' : 'border-gray-200 focus:border-indigo-500'
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
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
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
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component: Assign Store Owner
function AssignOwnerModal({ store, storeOwners, onClose, onSuccess }) {
  const [selectedOwnerId, setSelectedOwnerId] = useState(store?.ownerId || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedOwnerId) {
      setErrorMsg('Please select a store owner');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await assignStoreOwnerApi(store.id, selectedOwnerId);
      onSuccess(res?.store);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to assign store owner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-gray-100 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Assign Store Owner</h3>
            <p className="text-xs text-gray-500 truncate">{store.name}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAssign}>
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Select Store Owner
            </label>
            <select
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-medium"
            >
              <option value="">-- Choose Store Owner --</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedOwnerId}
              className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

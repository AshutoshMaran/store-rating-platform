import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar.jsx';
import { getOwnerDashboardApi } from '../api/owner.api.js';
import { Building2, Star, Users, ArrowUpDown, Search, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

export default function OwnerDashboardPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getOwnerDashboardApi();
      setStores(data?.stores || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load store owner dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Primary store
  const primaryStore = stores[0] || null;

  // Filter & sort the ratings of the primary store
  const processedRatings = useMemo(() => {
    if (!primaryStore || !primaryStore.ratings) return [];

    let list = [...primaryStore.ratings];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          (r.userName && r.userName.toLowerCase().includes(q)) ||
          (r.userEmail && r.userEmail.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB ? valB.toLowerCase() : '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [primaryStore, searchTerm, sortField, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Owner Portal</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor store performance, customer reviews, and overall ratings
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-200 animate-pulse h-40"></div>
            <div className="bg-white rounded-3xl p-8 border border-gray-200 animate-pulse h-64"></div>
          </div>
        ) : !primaryStore ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No Store Assigned</h3>
            <p className="text-xs text-gray-500 mt-1">
              You do not have a store assigned to your account yet. Please contact the System Administrator.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Store Overview Card & Metric Highlights */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                      Managed Store
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
                      {primaryStore.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {primaryStore.address} • {primaryStore.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  {/* Average Rating Metric */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center min-w-[140px]">
                    <span className="text-xs font-semibold text-amber-800">Average Rating</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                      <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                        {primaryStore.averageRating > 0 ? primaryStore.averageRating : '0.0'}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 mt-0.5">out of 5.0</span>
                  </div>

                  {/* Total Reviews Metric */}
                  <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center min-w-[140px]">
                    <span className="text-xs font-semibold text-indigo-800">Total Reviews</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Users className="w-6 h-6 text-indigo-600" />
                      <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                        {primaryStore.totalRatings}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 mt-0.5">verified ratings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Ratings Section */}
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Customer Ratings & Reviews</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Detailed list of all customers who evaluated your store
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search customer name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <th
                        onClick={() => handleSort('userName')}
                        className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Customer Name</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('userEmail')}
                        className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Email Address</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('rating')}
                        className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Rating</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('updatedAt')}
                        className="py-3.5 px-6 cursor-pointer hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Date Submitted</span>
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {processedRatings.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-gray-400">
                          {searchTerm
                            ? 'No customer ratings match your search.'
                            : 'No customer ratings have been submitted for your store yet.'}
                        </td>
                      </tr>
                    ) : (
                      processedRatings.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6 font-semibold text-gray-900">
                            {item.userName}
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {item.userEmail}
                          </td>
                          <td className="py-4 px-6">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{item.rating} / 5</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>
                                {new Date(item.updatedAt || item.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

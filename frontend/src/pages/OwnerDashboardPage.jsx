import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar.jsx';
import { getOwnerDashboardApi } from '../api/owner.api.js';
import {
  Building2,
  Star,
  Users,
  ArrowUpDown,
  Search,
  Calendar,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  LayoutGrid,
  Table
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [storeViewMode, setStoreViewMode] = useState('cards'); // 'cards' | 'table'
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Sorting for the stores table
  const [storeSortField, setStoreSortField] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getOwnerDashboardApi();
      const loadedStores = data?.stores || [];
      setStores(loadedStores);

      // Default to first store if not selected or current selection no longer exists
      if (loadedStores.length > 0 && (!selectedStoreId || !loadedStores.some((s) => s.id === selectedStoreId))) {
        setSelectedStoreId(loadedStores[0].id);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load store owner dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update selection if stores change
  useEffect(() => {
    if (stores.length > 0 && (!selectedStoreId || !stores.some((s) => s.id === selectedStoreId))) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleStoreSort = (field) => {
    if (storeSortField === field) {
      setStoreSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setStoreSortField(field);
      setStoreSortOrder('asc');
    }
  };

  // Currently selected store
  const activeStore = stores.find((s) => s.id === selectedStoreId) || stores[0] || null;

  // Sorted list of stores for Table View
  const sortedStores = useMemo(() => {
    let list = [...stores];
    list.sort((a, b) => {
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
    return list;
  }, [stores, storeSortField, storeSortOrder]);

  // Filter & sort ratings for the currently selected store
  const processedRatings = useMemo(() => {
    if (!activeStore || !activeStore.ratings) return [];

    let list = [...activeStore.ratings];

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
  }, [activeStore, searchTerm, sortField, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Owner Portal</h1>
              {stores.length > 1 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  {stores.length} Stores
                </span>
              )}
            </div>
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
            <div className="flex gap-5 overflow-x-hidden">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[320px] sm:w-[350px] shrink-0 bg-white rounded-3xl p-6 border border-gray-200 animate-pulse h-48"
                ></div>
              ))}
            </div>
            <div className="bg-white rounded-3xl p-8 border border-gray-200 animate-pulse h-64"></div>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No Store Assigned</h3>
            <p className="text-xs text-gray-500 mt-1">
              You do not have any stores assigned to your account yet. Please contact the System Administrator.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stores Section Header & View Toggle */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    {stores.length > 1 ? 'Your Managed Stores' : 'Your Store'}
                  </h2>
                  {stores.length > 1 && (
                    <span className="text-xs text-gray-500">
                      {storeViewMode === 'cards'
                        ? 'Scroll horizontally or click any store to view its customer reviews'
                        : 'Click any row in the table to view its customer reviews'}
                    </span>
                  )}
                </div>

                {/* View Switcher: Cards Row vs Table */}
                {stores.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-gray-200/70 p-1 rounded-xl self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setStoreViewMode('cards')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        storeViewMode === 'cards'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Cards Row</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStoreViewMode('table')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        storeViewMode === 'table'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table View</span>
                    </button>
                  </div>
                )}
              </div>

              {/* View Mode 1: Scrollable Horizontal Row of Cards */}
              {storeViewMode === 'cards' ? (
                <div className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth">
                  {stores.map((store) => {
                    const isSelected = activeStore?.id === store.id;

                    return (
                      <div
                        key={store.id}
                        onClick={() => setSelectedStoreId(store.id)}
                        className={`w-[320px] sm:w-[350px] shrink-0 snap-start rounded-3xl p-6 border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-50/40 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                            : 'bg-white border-gray-200/80 hover:border-amber-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Active Indicator Badge */}
                        {isSelected && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Selected</span>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                                isSelected
                                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                                  : 'bg-gray-50 text-gray-600 border-gray-200'
                              }`}
                            >
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 pr-14">
                              <h3 className="text-base font-bold text-gray-900 truncate" title={store.name}>
                                {store.name}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">{store.email}</p>
                            </div>
                          </div>

                          <p className="text-xs text-gray-600 line-clamp-2 mb-4 bg-white/70 p-2.5 rounded-xl border border-gray-100">
                            {store.address}
                          </p>
                        </div>

                        {/* Store Metrics */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                          <div className="p-2.5 rounded-xl bg-white border border-gray-100 flex flex-col items-center">
                            <span className="text-[10px] font-medium text-gray-500">Average Rating</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="text-base font-extrabold text-gray-900">
                                {store.averageRating > 0 ? store.averageRating : '0.0'}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-gray-100 flex flex-col items-center">
                            <span className="text-[10px] font-medium text-gray-500">Total Reviews</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Users className="w-4 h-4 text-indigo-600" />
                              <span className="text-base font-extrabold text-gray-900">
                                {store.totalRatings}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* View Mode 2: Table of All Added Stores */
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                          <th
                            onClick={() => handleStoreSort('name')}
                            className="py-3.5 px-6 cursor-pointer hover:text-amber-600 transition-colors"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Store Name</span>
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </div>
                          </th>
                          <th
                            onClick={() => handleStoreSort('email')}
                            className="py-3.5 px-6 cursor-pointer hover:text-amber-600 transition-colors"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Email</span>
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </div>
                          </th>
                          <th
                            onClick={() => handleStoreSort('address')}
                            className="py-3.5 px-6 cursor-pointer hover:text-amber-600 transition-colors"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Address</span>
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </div>
                          </th>
                          <th
                            onClick={() => handleStoreSort('averageRating')}
                            className="py-3.5 px-6 cursor-pointer hover:text-amber-600 transition-colors"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Average Rating</span>
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </div>
                          </th>
                          <th
                            onClick={() => handleStoreSort('totalRatings')}
                            className="py-3.5 px-6 cursor-pointer hover:text-amber-600 transition-colors"
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Total Reviews</span>
                              <ArrowUpDown className="w-3.5 h-3.5" />
                            </div>
                          </th>
                          <th className="py-3.5 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                        {sortedStores.map((store) => {
                          const isSelected = activeStore?.id === store.id;

                          return (
                            <tr
                              key={store.id}
                              onClick={() => setSelectedStoreId(store.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-amber-50/50 font-medium' : 'hover:bg-slate-50/60'
                              }`}
                            >
                              <td className="py-4 px-6 font-bold text-gray-900">{store.name}</td>
                              <td className="py-4 px-6 text-gray-600">{store.email}</td>
                              <td className="py-4 px-6 text-gray-600 max-w-xs truncate" title={store.address}>
                                {store.address}
                              </td>
                              <td className="py-4 px-6">
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span>{store.averageRating > 0 ? store.averageRating : '0.0'}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 font-semibold text-gray-700">
                                {store.totalRatings}
                              </td>
                              <td className="py-4 px-6 text-right">
                                {isSelected ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                    <CheckCircle2 className="w-3 h-3" /> Selected
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedStoreId(store.id);
                                    }}
                                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-amber-800 bg-gray-100 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    View Reviews
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Ratings Section for the Active Store */}
            {activeStore && (
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Customer Ratings & Reviews
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {activeStore.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Showing reviews submitted by customers for{' '}
                      <span className="font-semibold text-gray-700">{activeStore.name}</span>
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
                              : `No customer ratings have been submitted for ${activeStore.name} yet.`}
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
            )}
          </div>
        )}
      </main>
    </div>
  );
}
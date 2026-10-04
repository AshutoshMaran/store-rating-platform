import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar.jsx';
import RatingModal from '../components/RatingModal.jsx';
import { getAllStoresApi } from '../api/user.api.js';
import { Store, Search, Star, ArrowUpDown, MapPin, Mail, AlertCircle, RefreshCw } from 'lucide-react';

export default function UserDashboardPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [activeModalStore, setActiveModalStore] = useState(null);

  const fetchStores = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getAllStoresApi();
      setStores(data?.stores || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleRatingSuccess = (storeId, newRating) => {
    setStores((prevStores) =>
      prevStores.map((s) => {
        if (s.id === storeId) {
          const hadRating = s.userRating !== null && s.userRating !== undefined;
          const prevTotal = s.totalRatings || 0;
          const prevOverall = s.overallRating || 0;

          let newTotal = prevTotal;
          let newOverall = prevOverall;

          if (hadRating) {
            // Updated existing rating
            const oldSum = prevOverall * prevTotal;
            const newSum = oldSum - s.userRating + newRating;
            newOverall = Number((newSum / (prevTotal || 1)).toFixed(1));
          } else {
            // New rating submitted
            newTotal = prevTotal + 1;
            const newSum = prevOverall * prevTotal + newRating;
            newOverall = Number((newSum / newTotal).toFixed(1));
          }

          return {
            ...s,
            userRating: newRating,
            overallRating: newOverall,
            totalRatings: newTotal,
          };
        }
        return s;
      })
    );
  };

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort stores
  const filteredAndSortedStores = useMemo(() => {
    let result = [...stores];

    // Filter by name and address
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.address && s.address.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
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

    return result;
  }, [stores, searchTerm, sortField, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Explore Stores</h1>
            <p className="text-sm text-gray-500 mt-1">
              Find registered stores, view overall ratings, and share your experience
            </p>
          </div>

          <button
            onClick={fetchStores}
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter & Sort Controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by store name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Quick Sort Options */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-gray-500 shrink-0">Sort by:</span>
            <button
              onClick={() => handleSortToggle('name')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                sortField === 'name'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>Name</span>
              <ArrowUpDown className="w-3 h-3" />
              {sortField === 'name' && (
                <span className="text-[10px] text-indigo-500 font-bold uppercase">{sortOrder}</span>
              )}
            </button>

            <button
              onClick={() => handleSortToggle('address')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                sortField === 'address'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>Address</span>
              <ArrowUpDown className="w-3 h-3" />
              {sortField === 'address' && (
                <span className="text-[10px] text-indigo-500 font-bold uppercase">{sortOrder}</span>
              )}
            </button>

            <button
              onClick={() => handleSortToggle('overallRating')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                sortField === 'overallRating'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>Rating</span>
              <ArrowUpDown className="w-3 h-3" />
              {sortField === 'overallRating' && (
                <span className="text-[10px] text-indigo-500 font-bold uppercase">{sortOrder}</span>
              )}
            </button>
          </div>
        </div>

        {/* Content States */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 animate-pulse space-y-4"
              >
                <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded-md w-full"></div>
                <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedStores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No stores found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'No stores match your search criteria. Try a different query.'
                : 'No stores have been registered on the platform yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStores.map((store) => {
              const hasRated = store.userRating !== null && store.userRating !== undefined;

              return (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl border border-gray-200/80 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Store Icon & Name */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate" title={store.name}>
                          {store.name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{store.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-4 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{store.address}</span>
                    </div>

                    {/* Rating Stats Badges */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {/* Overall Rating */}
                      <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100/80">
                        <span className="text-[11px] font-medium text-amber-800 block">Overall Rating</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-gray-900">
                            {store.overallRating > 0 ? store.overallRating : 'No ratings'}
                          </span>
                          {store.totalRatings > 0 && (
                            <span className="text-[11px] text-gray-500">
                              ({store.totalRatings})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* User's Rating */}
                      <div className={`p-2.5 rounded-xl border ${
                        hasRated
                          ? 'bg-indigo-50/60 border-indigo-100/80 text-indigo-900'
                          : 'bg-gray-50 border-gray-100 text-gray-500'
                      }`}>
                        <span className="text-[11px] font-medium block">Your Rating</span>
                        <div className="flex items-center gap-1 mt-1">
                          {hasRated ? (
                            <>
                              <Star className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                              <span className="text-sm font-bold text-indigo-900">
                                {store.userRating} / 5
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-medium text-gray-400 italic">
                              Not rated yet
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button: Rate / Modify */}
                  <button
                    type="button"
                    onClick={() => setActiveModalStore(store)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      hasRated
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${hasRated ? 'text-amber-500 fill-amber-500' : ''}`} />
                    <span>{hasRated ? 'Modify Your Rating' : 'Submit Rating'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Rating Modal */}
      {activeModalStore && (
        <RatingModal
          store={activeModalStore}
          initialRating={activeModalStore.userRating}
          onClose={() => setActiveModalStore(null)}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
}

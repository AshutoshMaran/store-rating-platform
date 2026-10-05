import { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import { rateStoreApi } from '../api/user.api.js';

export default function RatingModal({ store, initialRating, onClose, onSuccess }) {
  const [selectedRating, setSelectedRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setErrorMsg('Please select a rating between 1 and 5 stars');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await rateStoreApi(store.id, selectedRating);
      onSuccess(store.id, selectedRating);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-100 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-3 shadow-xs">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {initialRating ? 'Modify Your Rating' : 'Rate This Store'}
          </h3>
          <p className="text-sm font-semibold text-indigo-600 mt-1">{store?.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{store?.address}</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star selector */}
          <div className="flex justify-center items-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || selectedRating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      active
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-xs'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs font-semibold text-gray-600 mb-6">
            {selectedRating > 0 ? (
              <span className="text-indigo-600 font-bold">{selectedRating} out of 5 Stars</span>
            ) : (
              'Click on a star to rate'
            )}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedRating === 0}
              className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : initialRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

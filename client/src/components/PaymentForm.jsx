import { useState, useEffect } from 'react';
import { Smartphone, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import { getUserProfile, processPayment } from '../services/api';

const PRICING = {
  '* * * * *': { label: 'Every minute', price: 5.0 },
  '0 * * * *': { label: 'Every hour', price: 2.0 },
  '0 */6 * * *': { label: 'Every 6 hours', price: 1.0 },
  '0 */12 * * *': { label: 'Every 12 hours', price: 0.75 },
  '0 0 * * *': { label: 'Every day', price: 0.5 },
};

export default function PaymentForm({ interval, onSuccess, onError, onCancel }) {
  const { isDark } = useDarkMode();
  const [mobileNumber, setMobileNumber] = useState('');
  const [savedNumber, setSavedNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('form'); // 'form', 'processing', 'success', 'error'
  const [transactionId, setTransactionId] = useState('');

  // Fetch user profile to get saved number
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        setSavedNumber(res.data.user.preferredPaymentNumber || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const plan = PRICING[interval];
  const formattedAmount = `$${plan.price.toFixed(2)}`;

  const handleUseSavedNumber = () => {
    if (savedNumber) {
      setMobileNumber(savedNumber);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!mobileNumber.trim()) {
      setError('Mobile number is required');
      return;
    }

    if (mobileNumber.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    setStage('processing');

    try {
      const { data } = await processPayment({ interval, mobileNumber });

      setTransactionId(data.transactionId);
      setStage('success');
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setStage('error');
      setError(err?.response?.data?.message || 'Payment processing failed');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const bgClasses = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textClasses = isDark ? 'text-slate-300' : 'text-slate-600';
  const inputBgClasses = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500';

  const resetForm = () => {
    setMobileNumber('');
    setError('');
    setStage('form');
    setTransactionId('');
  };

  return (
    <div className={`rounded-xl border ${bgClasses} p-6 w-full max-w-md`}>
      {/* Form Stage */}
      {stage === 'form' && (
        <>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Confirm Payment
          </h2>
          <p className={`${textClasses} mb-6`}>
            for {plan.label} scheduled scraping
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Display */}
            <div className={`border rounded-lg p-4 ${isDark ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm ${textClasses} mb-1`}>Plan Amount</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {formattedAmount}
              </p>
            </div>

            {/* Mobile Number */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                Mobile Number
              </label>
              <div className="relative">
                <Smartphone className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="03001234567"
                  maxLength="15"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputBgClasses}`}
                  disabled={loading}
                  style={{ '--tw-ring-color': 'var(--color-primary)' }}
                />
              </div>
              
              {/* Use saved number */}
              <div className="mt-2">
                {savedNumber ? (
                  <button
                    type="button"
                    onClick={handleUseSavedNumber}
                    className="text-xs font-medium transition-colors"
                    style={{ color: 'var(--color-primary)' }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Use saved number ({savedNumber})
                  </button>
                ) : (
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    No saved number —{' '}
                    <a
                      href="/account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium transition-colors"
                      style={{ color: 'var(--color-primary)' }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      add one in Account Settings
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg border font-medium transition ${
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                } disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Pay with Easypaisa
              </button>
            </div>
          </form>
        </>
      )}

      {/* Processing Stage */}
      {stage === 'processing' && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Processing Payment
          </p>
          <p className={`${textClasses} text-sm mt-2`}>
            Please wait while we process your payment...
          </p>
        </div>
      )}

      {/* Success Stage */}
      {stage === 'success' && (
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Payment Successful!
          </p>
          <p className={`${textClasses} text-sm mt-2 text-center`}>
            Your {plan.label} subscription is now active
          </p>
          <div className={`mt-4 p-3 rounded-lg w-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <p className={`text-xs ${textClasses} mb-1`}>Transaction ID</p>
            <p className="font-mono text-sm break-all" style={{ color: 'var(--color-primary)' }}>
              {transactionId}
            </p>
          </div>
        </div>
      )}

      {/* Error Stage */}
      {stage === 'error' && (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Payment Failed
          </p>
          <p className={`${textClasses} text-sm mt-2 text-center`}>
            {error}
          </p>
          <button
            onClick={resetForm}
            className="mt-4 px-6 py-2 rounded-lg text-white font-medium transition"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

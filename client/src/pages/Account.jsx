import { useEffect, useState } from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import Layout from '../components/Layout';
import { getUserProfile, updateUserProfile } from '../services/api';
import { User, Mail, Smartphone, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Account() {
  const { isDark } = useDarkMode();
  const [form, setForm] = useState({ name: '', email: '', preferredPaymentNumber: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        setForm({
          name: res.data.user.name || '',
          email: res.data.user.email || '',
          preferredPaymentNumber: res.data.user.preferredPaymentNumber || '',
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        preferredPaymentNumber: form.preferredPaymentNumber.trim(),
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const bgClasses = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const inputBgClasses = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500';
  const textClasses = isDark ? 'text-slate-300' : 'text-slate-600';
  const labelClasses = isDark ? 'text-slate-300' : 'text-slate-700';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-pulse space-y-4">
            <div className={`w-64 h-8 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`w-96 h-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in-up max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
              <User size={24} className="text-white" />
            </div>
            Account Settings
          </h1>
          <p className={textClasses}>Manage your profile and payment preferences</p>
        </div>

        {/* Account Card */}
        <div className={`${bgClasses} border rounded-2xl p-8 card-fancy`}>
          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 animate-fade-in-up flex items-start gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 animate-fade-in-up flex items-start gap-3">
              <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p>{success}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${labelClasses}`}>
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={updating}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 ${inputBgClasses} disabled:opacity-50`}
                placeholder="Enter your name"
                style={{ '--tw-ring-color': 'var(--color-primary)' }}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${labelClasses}`}>
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={updating}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 ${inputBgClasses} disabled:opacity-50`}
                placeholder="Enter your email"
                style={{ '--tw-ring-color': 'var(--color-primary)' }}
              />
            </div>

            {/* Preferred Payment Number */}
            <div>
              <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${labelClasses}`}>
                <Smartphone size={16} />
                Preferred Easypaisa Number
              </label>
              <input
                type="tel"
                name="preferredPaymentNumber"
                value={form.preferredPaymentNumber}
                onChange={(e) => handleChange({ ...e, target: { ...e.target, name: 'preferredPaymentNumber', value: e.target.value.replace(/\D/g, '') } })}
                disabled={updating}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 ${inputBgClasses} disabled:opacity-50`}
                placeholder="03001234567"
                maxLength="15"
                style={{ '--tw-ring-color': 'var(--color-primary)' }}
              />
              <p className={`text-xs ${textClasses} mt-2`}>
                This number will be used as default when making scheduled scraping payments
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={updating}
                className="w-full px-8 py-3 rounded-lg text-white font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
              >
                <Save size={20} />
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className={`mt-8 pt-8 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <h3 className={`text-sm font-semibold mb-4 ${labelClasses}`}>About Your Account</h3>
            <div className={`space-y-2 text-sm ${textClasses}`}>
              <p>• Your email is used for login and important notifications</p>
              <p>• Your preferred payment number speeds up the payment process</p>
              <p>• All changes are saved immediately to your account</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

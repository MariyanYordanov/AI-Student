import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../hooks/useTheme';
import { Trash2, Mail, LogOut } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  lastActive: string;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.emailVerified) {
      navigate('/login');
    } else if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN')) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://ai-student-r9ay.onrender.com/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('admin.confirmDelete'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-student-r9ay.onrender.com/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== userId));
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting user');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://ai-student-r9ay.onrender.com/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === userId ? { ...u, role: updatedUser.role } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: updatedUser.role });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user role');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ai-student-r9ay.onrender.com/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          subject: emailData.subject,
          message: emailData.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setEmailData({ subject: '', message: '' });
      setShowEmailForm(false);
      alert(t('common.success'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errors.genericError'));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <header className={`shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {t('admin.title')}
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('common.appName')} ({user?.role})
            </p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            {t('common.logout')}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-red-900/20 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`px-6 py-4 ${isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {t('admin.userManagement')}
                </h2>
              </div>

              {loading ? (
                <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('common.loading')}
                </div>
              ) : users.length === 0 ? (
                <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('dashboard.noTopics')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={isDark ? 'bg-gray-700 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('admin.role')}
                        </th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('admin.email')}
                        </th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('admin.role')}
                        </th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('admin.status')}
                        </th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('admin.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className={isDark ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className={`cursor-pointer transition ${isDark ? (selectedUser?.id === u.id ? 'bg-blue-900/30' : 'hover:bg-gray-700') : (selectedUser?.id === u.id ? 'bg-blue-50' : 'hover:bg-gray-50')}`}
                          onClick={() => setSelectedUser(u)}
                        >
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {u.name}
                          </td>
                          <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {u.email}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(u.role)}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={u.emailVerified ? 'text-green-600' : 'text-red-600'}>
                              {u.emailVerified ? t('admin.verified') : t('admin.unverified')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(u.id);
                              }}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* User Details Panel */}
          <div className="lg:col-span-1">
            {selectedUser ? (
              <div className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedUser.name}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('admin.email')}
                    </label>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-900'}>{selectedUser.email}</p>
                  </div>

                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('admin.role')}
                    </label>
                    {user?.role === 'SUPERADMIN' ? (
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleChangeRole(selectedUser.id, e.target.value)}
                        className={`w-full mt-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'border border-gray-300 bg-white'}`}
                      >
                        <option value="STUDENT">{t('admin.student')}</option>
                        <option value="ADMIN">{t('admin.admin')}</option>
                        <option value="SUPERADMIN">{t('admin.superAdmin')}</option>
                      </select>
                    ) : (
                      <p className={`px-3 py-2 rounded ${getRoleBadgeColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('admin.status')}
                    </label>
                    <p className={selectedUser.emailVerified ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {selectedUser.emailVerified ? t('admin.verified') : t('admin.unverified')}
                    </p>
                  </div>

                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('auth.errors.notFound')}
                    </label>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className={`${isDark ? 'border-gray-700' : 'border-gray-200'} border-t pt-4 space-y-3`}>
                    <button
                      onClick={() => setShowEmailForm(!showEmailForm)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Mail className="w-4 h-4" />
                      {t('admin.sendEmail')}
                    </button>

                    {user?.role === 'SUPERADMIN' && (
                      <button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('admin.deleteUser')}
                      </button>
                    )}
                  </div>
                </div>

                {showEmailForm && (
                  <form onSubmit={handleSendEmail} className={`mt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} border-t pt-4`}>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('auth.password')}
                        </label>
                        <input
                          type="text"
                          value={emailData.subject}
                          onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                          placeholder={t('admin.characterName')}
                          className={`w-full mt-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'border border-gray-300'}`}
                          required
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('auth.password')}
                        </label>
                        <textarea
                          value={emailData.message}
                          onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                          placeholder={t('admin.characterName')}
                          rows={4}
                          className={`w-full mt-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'border border-gray-300'}`}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        {t('admin.sendEmail')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className={`rounded-lg shadow p-6 text-center ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}>
                {t('dashboard.noTopics')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

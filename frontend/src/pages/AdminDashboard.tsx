import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
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
    if (!confirm('Are you sure you want to delete this user?')) {
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
      alert('Email sent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending email');
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Logged in as {user.email} ({user.role})</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Users</h2>
              </div>

              {loading ? (
                <div className="p-6 text-center text-gray-600">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="p-6 text-center text-gray-600">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Verified</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className={`cursor-pointer hover:bg-gray-50 ${selectedUser?.id === u.id ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedUser(u)}
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">{u.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(u.role)}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={u.emailVerified ? 'text-green-600' : 'text-red-600'}>
                              {u.emailVerified ? 'Yes' : 'No'}
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
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedUser.name}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    {user?.role === 'SUPERADMIN' ? (
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleChangeRole(selectedUser.id, e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPERADMIN">SuperAdmin</option>
                      </select>
                    ) : (
                      <p className={`px-3 py-2 rounded ${getRoleBadgeColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Verified</label>
                    <p className={selectedUser.emailVerified ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {selectedUser.emailVerified ? 'Yes' : 'No'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Joined</label>
                    <p className="text-gray-600">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Active</label>
                    <p className="text-gray-600">{new Date(selectedUser.lastActive).toLocaleString()}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <button
                      onClick={() => setShowEmailForm(!showEmailForm)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </button>

                    {user?.role === 'SUPERADMIN' && (
                      <button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete User
                      </button>
                    )}
                  </div>
                </div>

                {showEmailForm && (
                  <form onSubmit={handleSendEmail} className="mt-4 border-t border-gray-200 pt-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <input
                          type="text"
                          value={emailData.subject}
                          onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                          placeholder="Email subject"
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Message</label>
                        <textarea
                          value={emailData.message}
                          onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                          placeholder="Email message (HTML supported)"
                          rows={4}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Send Email
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                Select a user to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        api.get('/api/admin/pending-users'),
        api.get('/api/admin/all-users')
      ]);
      setPendingUsers(pendingRes.data);
      setAllUsers(allRes.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    try {
      await api.post(`/api/admin/approve-user/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  const rejectUser = async (userId) => {
    try {
      await api.post(`/api/admin/reject-user/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to reject user:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Pending Approvals ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All Users ({allUsers.length})
          </button>
        </div>

        {/* Pending Users */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow">
            {pendingUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No pending approvals
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-900 font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-gray-900 font-semibold">Username</th>
                      <th className="px-6 py-3 text-left text-gray-900 font-semibold">Signup Date</th>
                      <th className="px-6 py-3 text-left text-gray-900 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">{user.username}</td>
                        <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 space-x-3">
                          <button
                            onClick={() => approveUser(user.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectUser(user.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All Users */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-900 font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-gray-900 font-semibold">Username</th>
                  <th className="px-6 py-3 text-left text-gray-900 font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-gray-900 font-semibold">Role</th>
                  <th className="px-6 py-3 text-left text-gray-900 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        u.status === 'approved' ? 'bg-green-100 text-green-800' :
                        u.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

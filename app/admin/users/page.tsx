'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, Search, Filter, UserPlus, Download, Eye, Users, UserCheck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import UserFormModal from '../components/UserFormModal';
import UserDeleteConfirmModal from '../components/DeleteConfirmUserModal';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate?: string;
    genre?: string;
    role: 'user' | 'admin';
    favoriteProducts?: string[];
    orders?: string[];
    address?: string;
    createdAt: string;
    updatedAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'created' | 'role'>('created');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/user');
            const data = await res.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
            toast.error('Could not load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter and search functionality
    useEffect(() => {
        let filtered = users.filter(user => {
            const matchesSearch = searchTerm === '' ||
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === 'all' || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });

        // Sort users
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                    break;
                case 'email':
                    comparison = a.email.localeCompare(b.email);
                    break;
                case 'created':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'role':
                    comparison = a.role.localeCompare(b.role);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredUsers(filtered);
    }, [users, searchTerm, roleFilter, sortBy, sortOrder]);

    const exportToCSV = () => {
        const csvContent = [
            ['Name', 'Email', 'Role', 'Genre', 'Birth Date', 'Created'],
            ...filteredUsers.map(user => [
                `${user.firstName} ${user.lastName}`,
                user.email,
                user.role,
                user.genre || '',
                user.birthDate ? dayjs(user.birthDate).format('YYYY-MM-DD') : '',
                dayjs(user.createdAt).format('YYYY-MM-DD')
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${dayjs().format('YYYY-MM-DD')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Users exported successfully!');
    };

    const handleSort = (field: typeof sortBy) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: typeof sortBy) => {
        if (sortBy !== field) return '↕️';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        users: users.filter(u => u.role === 'user').length,
        recentUsers: users.filter(u => dayjs().diff(dayjs(u.createdAt), 'days') <= 7).length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9c6b63] to-[#d4a574] bg-clip-text text-transparent">
                                User Management
                            </h1>
                            <p className="text-gray-600 mt-1">Manage your platform users and administrators</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-[#9c6b63] to-[#835852] hover:from-[#835852] hover:to-[#6b453f] transition-all duration-300 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add New User
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Regular Users</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.users}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Administrators</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.admins}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Eye className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">New This Week</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.recentUsers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9c6b63]/20 focus:border-[#9c6b63] transition-all duration-200"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9c6b63]/20 focus:border-[#9c6b63] transition-all duration-200 bg-white"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="user">Users</option>
                                    <option value="admin">Admins</option>
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={exportToCSV}
                            className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
                        >
                            <Download className="w-5 h-5" />
                            Export CSV
                        </button>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#9c6b63] border-t-transparent"></div>
                            <p className="text-gray-500 ml-4">Loading users...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gradient-to-r from-[#fdf4f1] to-[#fef7f4]">
                                    <tr>
                                        <th
                                            className="p-4 text-left text-[#9c6b63] font-semibold cursor-pointer hover:bg-[#9c6b63]/5 transition-colors"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Name {getSortIcon('name')}
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 text-left text-[#9c6b63] font-semibold cursor-pointer hover:bg-[#9c6b63]/5 transition-colors"
                                            onClick={() => handleSort('email')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Email {getSortIcon('email')}
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-[#9c6b63] font-semibold">Genre</th>
                                        <th className="p-4 text-left text-[#9c6b63] font-semibold">Birth Date</th>
                                        <th
                                            className="p-4 text-left text-[#9c6b63] font-semibold cursor-pointer hover:bg-[#9c6b63]/5 transition-colors"
                                            onClick={() => handleSort('role')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Role {getSortIcon('role')}
                                            </div>
                                        </th>
                                        <th
                                            className="p-4 text-left text-[#9c6b63] font-semibold cursor-pointer hover:bg-[#9c6b63]/5 transition-colors"
                                            onClick={() => handleSort('created')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Created {getSortIcon('created')}
                                            </div>
                                        </th>
                                        <th className="p-4 text-left text-[#9c6b63] font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((user, index) => (
                                        <tr
                                            key={user._id}
                                            className={`hover:bg-gradient-to-r hover:from-[#fdf4f1]/60 hover:to-[#fef7f4]/60 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                                                }`}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-[#9c6b63] to-[#d4a574] rounded-full flex items-center justify-center text-white font-semibold">
                                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                                                        <p className="text-sm text-gray-500">ID: {user._id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-700">{user.email}</td>
                                            <td className="p-4">
                                                <span className="capitalize text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-sm">
                                                    {user.genre || 'Not specified'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {user.birthDate ? dayjs(user.birthDate).format('MMM DD, YYYY') : '—'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`capitalize px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                <div>
                                                    <p>{dayjs(user.createdAt).format('MMM DD, YYYY')}</p>
                                                    <p className="text-xs text-gray-400">{dayjs(user.createdAt).fromNow()}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        title="Edit User"
                                                        className="p-2 rounded-lg hover:bg-[#9c6b63]/10 text-[#9c6b63] transition-all duration-200 hover:scale-105"
                                                    >
                                                        <Pencil className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteUser(user)}
                                                        title="Delete User"
                                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all duration-200 hover:scale-105"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No users found</p>
                                    <p className="text-gray-400">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <UserFormModal
                    mode="create"
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={fetchUsers}
                />
            )}

            {selectedUser && (
                <UserFormModal
                    mode="edit"
                    initialData={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onSuccess={fetchUsers}
                />
            )}

            {deleteUser && (
                <UserDeleteConfirmModal
                    userId={deleteUser._id}
                    userName={`${deleteUser.firstName} ${deleteUser.lastName}`}
                    onClose={() => setDeleteUser(null)}
                    onDeleted={fetchUsers}
                />
            )}
        </div>
    );
}
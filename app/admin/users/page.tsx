'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
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
    createdAt: string;
    updatedAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/user');
            const data = await res.json();
            setUsers(data);
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-[#9c6b63]">Manage Users</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#9c6b63] hover:bg-[#835852] transition text-white px-4 py-2 rounded-lg"
                >
                    + Add User
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading users...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 bg-white shadow rounded-xl">
                        <thead className="bg-[#fdf4f1]">
                            <tr>
                                <th className="p-3 text-left text-[#9c6b63]">Name</th>
                                <th className="p-3 text-left text-[#9c6b63]">Email</th>
                                <th className="p-3 text-left text-[#9c6b63]">Genre</th>
                                <th className="p-3 text-left text-[#9c6b63]">Birth Date</th>
                                <th className="p-3 text-left text-[#9c6b63]">Role</th>
                                <th className="p-3 text-left text-[#9c6b63]">Created</th>
                                <th className="p-3 text-left text-[#9c6b63]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-[#fdf4f1]/60 transition duration-150">
                                    <td className="p-3 text-neutral-800">{user.firstName} {user.lastName}</td>
                                    <td className="p-3 text-neutral-600">{user.email}</td>
                                    <td className="p-3 text-neutral-600 capitalize">{user.genre || '—'}</td>
                                    <td className="p-3 text-neutral-600">{user.birthDate ? dayjs(user.birthDate).format('YYYY-MM-DD') : '—'}</td>
                                    <td className="p-3 text-neutral-600 capitalize">{user.role}</td>
                                    <td className="p-3 text-neutral-500 text-sm">{dayjs(user.createdAt).format('YYYY-MM-DD')}</td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                title="Edit"
                                                className="p-2 rounded-md hover:bg-[#f5e1dd] text-[#9c6b63] transition"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteUser(user)}
                                                title="Delete"
                                                className="p-2 rounded-md hover:bg-red-100 text-red-600 transition"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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

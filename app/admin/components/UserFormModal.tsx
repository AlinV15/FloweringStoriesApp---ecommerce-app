'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    mode: 'create' | 'edit';
    initialData?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UserFormModal({ mode, initialData, onClose, onSuccess }: Props) {
    const isEdit = mode === 'edit';

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        genre: '',
        role: 'user'
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit && initialData) {
            setForm({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                birthDate: initialData.birthDate?.slice(0, 10) || '',
                genre: initialData.genre || '',
                role: initialData.role || 'user',
            });
        }
    }, [isEdit, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const method = 'PUT'
        const url = `/api/user/${initialData._id}`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error('Failed to save user');

            toast.success(`User updated successfully`);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-[#9c6b63]">
                    {isEdit ? 'Edit User' : 'Create User'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                        <input
                            type="date"
                            name="birthDate"
                            value={form.birthDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                        <select
                            name="genre"
                            value={form.genre}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="">—</option>
                            <option value="man">Man</option>
                            <option value="woman">Woman</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-[#9c6b63] text-white rounded hover:bg-[#835852]"
                        >
                            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
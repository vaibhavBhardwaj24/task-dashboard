"use client";
import { useState } from 'react';
import api from '../../lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { email, password });
            toast.success('Registration successful! Please log in.');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
            <div className="w-full max-w-md p-8 bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700">
                <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">Create Account</h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-400">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-400">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 font-semibold rounded-lg transition-colors focus:ring-4 focus:ring-green-500/50"
                    >
                        Register
                    </button>
                    <p className="text-center text-neutral-400 text-sm mt-4">
                        Already have an account? <a href="/login" className="text-green-400 hover:underline">Login</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

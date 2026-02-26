import { useState, useEffect } from 'react';
import type { Task } from './TaskCard';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (taskData: Partial<Task>) => void;
    initialData?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSubmit, initialData }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setDescription(initialData.description || '');
                setStatus(initialData.status);
            } else {
                setTitle('');
                setDescription('');
                setStatus('pending');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            description,
            status,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-neutral-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-800">
                <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? 'Edit Task' : 'Create Task'}
                    </h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                        &times;
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-300">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Complete the project documentation"
                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-white"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 text-neutral-300">Description</label>
                        <textarea
                            rows={4}
                            placeholder="Add more details about this task..."
                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-white resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                         <label className="block text-sm font-medium mb-1 text-neutral-300">Status</label>
                         <select
                            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-white appearance-none"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                         >
                             <option value="pending">Pending</option>
                             <option value="in-progress">In Progress</option>
                             <option value="completed">Completed</option>
                         </select>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
                        >
                            {initialData ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

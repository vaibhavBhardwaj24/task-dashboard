"use client";
import { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Loader2, LogOut, LayoutGrid, List } from 'lucide-react';
import TaskCard, { Task } from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import KanbanBoard from '../components/KanbanBoard';

export default function Dashboard() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination and Filtering State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTitle, setSearchTitle] = useState('');
    
    // Modal and View State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/tasks', {
                params: {
                    page,
                    limit: 10,
                    status: statusFilter || undefined,
                    search: searchTitle || undefined,
                },
            });
            setTasks(data.tasks);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error(error);
            // Ignore 401s here, let interceptor handle it
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, searchTitle]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchTasks();
    }, [fetchTasks, router]);

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await api.post('/auth/logout', { token: refreshToken });
        } catch (e) {
            // ignore
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/login');
            toast.success('Logged out successfully');
        }
    };

    const handleCreateTask = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleToggleTask = async (id: string) => {
        try {
            const res = await api.patch(`/tasks/${id}/toggle`);
            setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
            toast.success('Task status updated');
        } catch (error) {
            toast.error('Failed to toggle task');
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        const previousTasks = [...tasks];
        
        // Optimistically update the UI first
        setTasks((prev) => 
            prev.map((t) => t.id === id ? { ...t, status: newStatus as Task['status'] } : t)
        );

        try {
            // Apply in background
            const res = await api.patch(`/tasks/${id}`, { status: newStatus });
            // Sync with backend state (like updatedAt) silently
            setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
            toast.success('Task status updated');
        } catch (error) {
            setTasks(previousTasks); // Revert on failure
            toast.error('Failed to update status, reverted changes.');
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks((prev) => prev.filter((t) => t.id !== id));
            toast.success('Task deleted');
            if (tasks.length === 1 && page > 1) {
                setPage((prev) => prev - 1);
            } else {
                fetchTasks(); // refresh total items pagination
            }
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const handleModalSubmit = async (taskData: Partial<Task>) => {
        try {
            if (editingTask) {
                await api.patch(`/tasks/${editingTask.id}`, taskData);
                toast.success('Task updated');
            } else {
                await api.post('/tasks', taskData);
                toast.success('Task created');
                setPage(1); // Go to first page to see new task
            }
            setIsModalOpen(false);
            fetchTasks();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-blue-500/30">
            {/* Header */}
            <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                            ✓
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">TaskFlow</h1>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors p-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-neutral-200"
                            value={searchTitle}
                            onChange={(e) => {
                                setSearchTitle(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="relative min-w-[160px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <select
                            className="w-full pl-10 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none text-neutral-200"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden text-neutral-400">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 transition-colors focus:outline-none ${viewMode === 'list' ? 'bg-neutral-800 text-white' : 'hover:text-white hover:bg-neutral-800/50'}`}
                            title="List View"
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 transition-colors focus:outline-none ${viewMode === 'kanban' ? 'bg-neutral-800 text-white' : 'hover:text-white hover:bg-neutral-800/50'}`}
                            title="Kanban View"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={handleCreateTask}
                        className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
                    >
                        <Plus className="w-5 h-5" />
                        New Task
                    </button>
                </div>

                {/* Task List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                            <p>Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
                            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-neutral-500" />
                            </div>
                            <h3 className="text-xl font-medium text-neutral-300 mb-2">No tasks found</h3>
                            <p className="text-neutral-500 max-w-sm">
                                {searchTitle || statusFilter 
                                    ? "We couldn't find any tasks matching your current filters. Try changing them."
                                    : "You don't have any tasks yet. Create one to get started!"}
                            </p>
                            {(!searchTitle && !statusFilter) && (
                                <button 
                                    onClick={handleCreateTask}
                                    className="mt-6 text-blue-400 font-medium hover:text-blue-300 transition-colors"
                                >
                                    Create your first task &rarr;
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {viewMode === 'list' ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {tasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onToggle={handleToggleTask}
                                            onEdit={handleEditTask}
                                            onDelete={handleDeleteTask}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <KanbanBoard
                                    tasks={tasks}
                                    onToggle={handleToggleTask}
                                    onEdit={handleEditTask}
                                    onDelete={handleDeleteTask}
                                    onStatusChange={handleStatusChange}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 border border-neutral-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-neutral-400 px-4">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 border border-neutral-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingTask}
            />
        </div>
    );
}

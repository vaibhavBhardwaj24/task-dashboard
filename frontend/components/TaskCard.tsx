import { CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    createdAt: string;
    updatedAt: string;
}

interface TaskCardProps {
    task: Task;
    onToggle: (id: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
    const isCompleted = task.status === 'completed';

    return (
        <div className={`p-5 rounded-xl border ${isCompleted ? 'border-neutral-800 bg-neutral-800/50 opacity-75' : 'border-neutral-700 bg-neutral-800'} shadow-sm transition-all hover:shadow-md`}>
            <div className="flex items-start justify-between gap-4">
                <button 
                    onClick={() => onToggle(task.id)}
                    className="mt-1 flex-shrink-0 text-neutral-400 hover:text-blue-500 transition-colors"
                >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6" />}
                </button>
                
                <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold truncate ${isCompleted ? 'line-through text-neutral-500' : 'text-neutral-100'}`}>
                        {task.title}
                    </h3>
                    {task.description && (
                        <p className={`mt-1 text-sm ${isCompleted ? 'text-neutral-600' : 'text-neutral-400'} line-clamp-2`}>
                            {task.description}
                        </p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
                        <span className={`px-2 py-0.5 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                            task.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-neutral-500/10 text-neutral-400'
                        }`}>
                            {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span>•</span>
                        <span>{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onEdit(task)}
                        className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(task.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import TaskCard, { Task } from './TaskCard';

type Status = 'pending' | 'in-progress' | 'completed';

interface KanbanBoardProps {
    tasks: Task[];
    onToggle: (id: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, newStatus: Status) => void;
}

export default function KanbanBoard({ tasks, onToggle, onEdit, onDelete, onStatusChange }: KanbanBoardProps) {
    const columns: { id: Status; title: string, color: string }[] = [
        { id: 'pending', title: 'Pending', color: 'bg-neutral-500/10 border-neutral-700 text-neutral-400' },
        { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' },
        { id: 'completed', title: 'Completed', color: 'bg-green-500/10 border-green-500/30 text-green-400' }
    ];

    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedTaskId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow drop
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: Status) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (task && task.status !== status) {
                onStatusChange(taskId, status);
            }
        }
        setDraggedTaskId(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(column => {
                const columnTasks = tasks.filter(t => t.status === column.id);

                return (
                    <div 
                        key={column.id} 
                        className={`flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        <div className={`p-4 border-b ${column.color} flex items-center justify-between`}>
                            <h3 className="font-semibold">{column.title}</h3>
                            <span className="bg-neutral-900/50 text-xs px-2 py-1 rounded-full border border-neutral-700">
                                {columnTasks.length}
                            </span>
                        </div>
                        
                        <div className="flex-1 p-4 space-y-4 min-h-[300px] overflow-y-auto">
                            {columnTasks.map(task => (
                                <div 
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    // Make sure it looks slightly transparent when dragged
                                    className={`cursor-grab active:cursor-grabbing transition-opacity ${draggedTaskId === task.id ? 'opacity-50' : 'opacity-100'}`}
                                >
                                    <TaskCard 
                                        task={task}
                                        onToggle={onToggle}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                </div>
                            ))}
                            
                            {columnTasks.length === 0 && (
                                <div className="h-full flex items-center justify-center text-neutral-600 text-sm border-2 border-dashed border-neutral-800 rounded-xl">
                                    Drop tasks here
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

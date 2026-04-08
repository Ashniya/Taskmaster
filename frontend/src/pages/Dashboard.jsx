import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

import { format, isPast, isToday, isSameDay } from 'date-fns';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';

import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    LayoutGrid, List as ListIcon, Plus, Calendar, CheckCircle2, 
    Circle, Trash2, Search, Filter, MoreVertical, Pin, BarChart3 
} from 'lucide-react';
import Analytics from '../components/Analytics';

// Draggable Task Card
const TaskCard = ({ task, priorityStyles, toggleComplete, handleDelete, togglePin, isDark }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id });
    
    // Custom style for drag transform
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getDeadlineBadge = (date) => {
        if (!date) return null;
        const dateObj = new Date(date);
        if (isPast(dateObj) && !isToday(dateObj)) return <span className="flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full"><Calendar size={10}/> Overdue</span>;
        if (isToday(dateObj)) return <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><Calendar size={10}/> Today</span>;
        return <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}><Calendar size={10}/> {format(dateObj, 'MMM d')}</span>;
    };

    const getTimeString = (date) => {
        if (!date) return null;
        const dateObj = new Date(date);
        const hasTime = dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0;
        if (!hasTime) return null;
        return format(dateObj, 'h:mm a');
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            className={`group p-4 rounded-xl border shadow-sm hover:shadow-md transition-all touch-none relative ${
                isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-100 hover:border-indigo-100'
            } ${task.completed ? 'opacity-75' : ''} ${task.isPinned ? (isDark ? 'border-l-4 border-l-indigo-400' : 'border-l-4 border-l-indigo-500') : ''}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <button 
                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking checkbox
                        onClick={() => toggleComplete(task)}
                        className={`mt-1 transition-colors ${task.completed ? 'text-emerald-500' : isDark ? 'text-gray-600 hover:text-emerald-500' : 'text-gray-300 hover:text-emerald-500'}`}
                    >
                        {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                             <h3 className={`font-medium text-sm mb-1 ${task.completed ? 'line-through text-gray-500' : isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                {task.title}
                            </h3>
                            {task.isPinned && <Pin size={12} className="text-indigo-500 fill-indigo-500 mb-1" />}
                        </div>
                       
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${priorityStyles[task.priority]}`}>
                                {task.priority}
                            </span>
                            {task.estimatedTime && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                                    ⏱️ {task.estimatedTime}
                                </span>
                            )}
                            {getDeadlineBadge(task.deadline)}
                            {getTimeString(task.deadline) && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                                    {getTimeString(task.deadline)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button 
                         onPointerDown={(e) => e.stopPropagation()}
                         onClick={() => togglePin(task)}
                         className={`p-1 transition-all ${task.isPinned ? 'text-indigo-500 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-indigo-500'}`}
                         title={task.isPinned ? "Unpin task" : "Pin task"}
                    >
                        <Pin size={16} className={task.isPinned ? "fill-indigo-500" : ""} />
                    </button>
                    <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => handleDelete(task._id)}
                        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = ({ isDark }) => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({ title: '', priority: 'Medium', deadline: '', estimatedTime: '', recurrence: 'none' });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [view, setView] = useState('board'); // 'list' or 'board'
    const [search, setSearch] = useState('');
    const [filterDate, setFilterDate] = useState(''); // New date filter state
    const [activeId, setActiveId] = useState(null); // For Drag Overlay

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            const res = await api.get('/api/tasks');
            setTasks(res.data);
        } catch (err) { console.error(err); }
    };
    useEffect(() => { fetchTasks(); }, []);

    // Form handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/api/tasks', form);
        setForm({ title: '', priority: 'Medium', deadline: '', estimatedTime: '', recurrence: 'none' });
        setIsFormOpen(false);
        fetchTasks();
    };

    const handleDelete = async (id) => {
        await api.delete(`/api/tasks/${id}`);
        fetchTasks();
    };

    const toggleComplete = async (task) => {
        // Optimistic update
        const updatedTasks = tasks.map(t => t._id === task._id ? { ...t, completed: !t.completed } : t);
        setTasks(updatedTasks);
        await api.put(`/api/tasks/${task._id}`, { completed: !task.completed });
        fetchTasks(); // Re-fetch to ensure sync
    };

    const togglePin = async (task) => {
         // Optimistic update
         const updatedTasks = tasks.map(t => t._id === task._id ? { ...t, isPinned: !t.isPinned } : t);
         setTasks(updatedTasks);
         await api.put(`/api/tasks/${task._id}`, { isPinned: !task.isPinned });
         fetchTasks();
    };

    // Drag and Drop Handlers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);
        
        if (!over) return;

        const activeTask = tasks.find(t => t._id === active.id);
        if (!activeTask) return;

        // Determine drop container
        let overContainer = over.id;
        
        // If sorting (dropped over another task), resolve the container from that task
        const overTask = tasks.find(t => t._id === over.id);
        if (overTask) {
            overContainer = overTask.completed ? 'completed' : 'pending';
        }

        const isCompletedContainer = overContainer === 'completed';
        
        // Only update if the container status differs from task status
        if (activeTask.completed !== isCompletedContainer) {
            await toggleComplete(activeTask);
            // Note: Reordering logic within the same container is handled by the SortableContext visually, 
            // but we aren't persisting order in DB currently.
        }
    };

    // Sorting Logic
    const getTaskCategory = (task) => {
        if (!task.deadline) return 2; // No deadline = Future/Low priority in date terms
        const date = new Date(task.deadline);
        if (isPast(date) && !isToday(date)) return 0; // Overdue
        if (isToday(date)) return 1; // Today
        return 2; // Future
    };

    const priorityWeight = { High: 3, Medium: 2, Low: 1 };

    const sortedTasks = [...tasks].sort((a, b) => {
        // 0. Pinned Tasks First
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

        // 1. Sort by Date Category (Overdue < Today < Future)
        const catA = getTaskCategory(a);
        const catB = getTaskCategory(b);
        if (catA !== catB) return catA - catB;

        // 2. Sort by Priority (High > Medium > Low)
        const prioA = priorityWeight[a.priority] || 0;
        const prioB = priorityWeight[b.priority] || 0;
        if (prioA !== prioB) return prioB - prioA; // Descending

        // 3. Secondary Date Sort (Ascending - sooner is higher)
        if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
        }
        return 0;
    });

    // Filter Logic
    const filteredTasks = sortedTasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchesDate = filterDate ? (t.deadline && isSameDay(new Date(t.deadline), new Date(filterDate))) : true;
        return matchesSearch && matchesDate;
    });

    const pendingTasks = filteredTasks.filter(t => !t.completed);
    const completedTasks = filteredTasks.filter(t => t.completed);

    const priorityStyles = {
        High: 'bg-red-50 text-red-700 border-red-100',
        Medium: 'bg-amber-50 text-amber-700 border-amber-100',
        Low: 'bg-green-50 text-green-700 border-green-100',
    };

    const TaskList = ({ items, id, title, icon: Icon, colorClass }) => (
        <div className={`p-4 rounded-2xl border flex flex-col h-full ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon size={18} />
                    </div>
                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        {items.length}
                    </span>
                </div>
            </div>
            
            <SortableContext items={items.map(t => t._id)} strategy={verticalListSortingStrategy}>
                <div 
                    // This div acts as the droppable area
                    className="flex-1 space-y-3 min-h-[100px]"
                >
                    {items.map(task => (
                        <TaskCard 
                            key={task._id} 
                            task={task} 
                            priorityStyles={priorityStyles} 
                            toggleComplete={toggleComplete} 
                            handleDelete={handleDelete}
                            isDark={isDark}
                        />
                    ))}
                    {items.length === 0 && (
                        <div className={`h-full border-2 border-dashed rounded-xl flex items-center justify-center p-8 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <p className="text-sm text-gray-400">Drag items here</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className={`min-h-screen pt-24 pb-12 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50/50'}`}>
                {/* Header Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {format(new Date(), 'EEEE, MMMM do')}
                            </p>
                        </div>

                        <div className="flex items-center p-1.5 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 bg-white">
                            <button onClick={() => setView('board')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${view === 'board' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                                <LayoutGrid size={18} />
                                Board
                            </button>
                            <button onClick={() => setView('list')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${view === 'list' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                                <ListIcon size={18} />
                                List
                            </button>
                            <button onClick={() => setShowAnalytics(!showAnalytics)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${showAnalytics ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                                <BarChart3 size={18} />
                                Analytics
                            </button>
                        </div>
                    </div>

                    {/* Analytics Section */}
                    {showAnalytics && (
                        <div className="mb-8 p-6 rounded-2xl border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm animate-in slide-in-from-top-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Productivity Analytics</h2>
                                <button onClick={() => setShowAnalytics(false)} className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Close</button>
                            </div>
                            <Analytics isDark={isDark} tasks={tasks} />
                        </div>
                    )}

                    {/* Stats */}
                    {!showAnalytics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[
                            { label: 'Total Tasks', value: tasks.length, icon: LayoutGrid, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { label: 'Pending', value: pendingTasks.length, icon: Circle, color: 'text-orange-600', bg: 'bg-orange-50' },
                            { label: 'Completed', value: completedTasks.length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                        ].map((stat, i) => (
                            <div key={i} className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                <div className="flex items-center justify-between">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</span>
                                </div>
                                <p className={`mt-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    )}

                    {/* Controls & Search */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative grow">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input 
                                type="text" 
                                placeholder="Search tasks..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                            />
                        </div>
                        <input 
                            type="text"
                            placeholder="Select Date"
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[150px] ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                        />
                        <button 
                            onClick={() => setIsFormOpen(!isFormOpen)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            <Plus size={20} />
                            New Task
                        </button>
                    </div>


                    {/* New Task Form */}
                    {isFormOpen && (
                        <form onSubmit={handleSubmit} className={`p-6 rounded-2xl mb-8 border animate-in slide-in-from-top-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex flex-col md:flex-row gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Task title..." 
                                    className={`grow p-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                    value={form.title} 
                                    onChange={e => setForm({...form, title: e.target.value})} 
                                    required autoFocus
                                />
                                <select 
                                    className={`p-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                    value={form.priority} 
                                    onChange={e => setForm({...form, priority: e.target.value})}
                                >
                                    <option>High</option><option>Medium</option><option>Low</option>
                                </select>
                                <input 
                                    type="datetime-local" 
                                    className={`p-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                    value={form.deadline} 
                                    onChange={e => setForm({...form, deadline: e.target.value})} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Est. Time (e.g. 2h)" 
                                    className={`p-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                    value={form.estimatedTime} 
                                    onChange={e => setForm({...form, estimatedTime: e.target.value})} 
                                />
                                <select 
                                    className={`p-3 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                    value={form.recurrence} 
                                    onChange={e => setForm({...form, recurrence: e.target.value})}
                                >
                                    <option value="none">No Repeat</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                                <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700">Add</button>
                            </div>
                        </form>
                    )}

                    {/* Board / List View */}
                    {view === 'board' ? (
                        <div className="grid md:grid-cols-2 gap-6 h-[500px]">
                            {/* We use Droppable IDs that match our logic in handleDragEnd: 'pending' (map to !completed) and 'completed' */}
                            <SortableContext items={pendingTasks.map(t => t._id)} strategy={verticalListSortingStrategy} id="pending">
                                <div className={`p-4 rounded-2xl border flex flex-col h-full ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`} id="pending-container">
                                    {/* Using a custom Droppable area for the container would be ideal, but for simplicity we rely on the tasks' SortableContext. 
                                        To make empty columns droppable, we need a useDroppable hook for the column itself. */}
                                    <DroppableColumn id="pending" title="Pending" icon={Circle} items={pendingTasks} isDark={isDark} colorClass="bg-orange-100 text-orange-600" priorityStyles={priorityStyles} toggleComplete={toggleComplete} handleDelete={handleDelete} togglePin={togglePin} />
                                </div>
                            </SortableContext>
                            
                            <SortableContext items={completedTasks.map(t => t._id)} strategy={verticalListSortingStrategy} id="completed">
                                <div className={`p-4 rounded-2xl border flex flex-col h-full ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`} id="completed-container">
                                    <DroppableColumn id="completed" title="Completed" icon={CheckCircle2} items={completedTasks} isDark={isDark} colorClass="bg-emerald-100 text-emerald-600" priorityStyles={priorityStyles} toggleComplete={toggleComplete} handleDelete={handleDelete} togglePin={togglePin} />
                                </div>
                            </SortableContext>
                        </div>
                    ) : (
                        <div className="space-y-3">
                             {filteredTasks.map(task => (
                                <TaskCard key={task._id} task={task} priorityStyles={priorityStyles} toggleComplete={toggleComplete} handleDelete={handleDelete} togglePin={togglePin} isDark={isDark} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <DragOverlay>
                {activeId ? (
                   <div className="opacity-80 rotate-2 cursor-grabbing">
                       <TaskCard 
                           task={tasks.find(t => t._id === activeId)} 
                           priorityStyles={priorityStyles} 
                           toggleComplete={() => {}} 
                           handleDelete={() => {}} 
                           isDark={isDark} 
                       />
                   </div>
                ) : null}
            </DragOverlay>
            <Assistant tasks={tasks} isDark={isDark} />
        </DndContext>
    );
};

// Helper for Droppable Columns
import { useDroppable } from '@dnd-kit/core';
import Assistant from '../components/Assistant';

const DroppableColumn = ({ id, title, icon: Icon, items, isDark, colorClass, priorityStyles, toggleComplete, handleDelete, togglePin }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon size={18} />
                    </div>
                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                        {items.length}
                    </span>
                </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {items.map(task => (
                    <TaskCard 
                        key={task._id} 
                        task={task} 
                        priorityStyles={priorityStyles} 
                        toggleComplete={toggleComplete} 
                        handleDelete={handleDelete}
                        togglePin={togglePin}
                        isDark={isDark}
                    />
                ))}
                {items.length === 0 && (
                    <div className={`h-32 border-2 border-dashed rounded-xl flex items-center justify-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className="text-sm text-gray-500">Drop here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
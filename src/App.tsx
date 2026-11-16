import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDown, ArrowUp, CalendarDays, Check, CheckCircle2, ChevronDown,
  Circle, Clock3, LayoutDashboard, ListTodo, MoreHorizontal, Plus, Search,
  SlidersHorizontal, Sparkles, Target, Trash2, X, Pencil, Flag
} from "lucide-react";

type Status = "Not started" | "In progress" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Update = { id: string; text: string; progress: number; date: string };
type Task = {
  id: string; title: string; description: string; status: Status; priority: Priority;
  startDate: string; dueDate: string; progress: number; updates: Update[]; createdAt: string;
};

const today = new Date().toISOString().slice(0, 10);
const seed: Task[] = [
  { id: "a1", title: "Plan the product launch", description: "Align the launch checklist, owners and key milestones.", status: "In progress", priority: "High", startDate: today, dueDate: addDays(today, 5), progress: 65, updates: [{ id: "u1", text: "Drafted the launch checklist and confirmed key milestones.", progress: 65, date: new Date().toISOString() }], createdAt: new Date().toISOString() },
  { id: "a2", title: "Refresh portfolio website", description: "Update the case studies and polish the homepage.", status: "In progress", priority: "Medium", startDate: today, dueDate: addDays(today, 12), progress: 35, updates: [], createdAt: new Date().toISOString() },
  { id: "a3", title: "Review monthly expenses", description: "Categorise spending and prepare a short summary.", status: "Not started", priority: "Low", startDate: today, dueDate: addDays(today, 2), progress: 0, updates: [], createdAt: new Date().toISOString() },
  { id: "a4", title: "Set up project workspace", description: "Create folders, docs and a shared project board.", status: "Completed", priority: "Medium", startDate: today, dueDate: today, progress: 100, updates: [], createdAt: new Date().toISOString() }
];
function addDays(date: string, days: number) { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
function formatDate(date: string) { return date ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date"; }
function daysLeft(date: string) { return Math.ceil((new Date(`${date}T23:59:59`).getTime() - Date.now()) / 86400000); }
const uid = () => Math.random().toString(36).slice(2, 10);

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try { const saved = localStorage.getItem("taskflow.tasks"); return saved ? JSON.parse(saved) : seed; } catch { return seed; }
  });
  const [view, setView] = useState("Overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All tasks");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);

  useEffect(() => { localStorage.setItem("taskflow.tasks", JSON.stringify(tasks)); }, [tasks]);
  const completed = tasks.filter(t => t.status === "Completed").length;
  const active = tasks.filter(t => t.status === "In progress").length;
  const overdue = tasks.filter(t => t.status !== "Completed" && t.dueDate && daysLeft(t.dueDate) < 0).length;
  const overall = tasks.length ? Math.round(tasks.reduce((n, t) => n + t.progress, 0) / tasks.length) : 0;
  const visible = useMemo(() => tasks.filter(t => {
    const match = `${t.title} ${t.description}`.toLowerCase().includes(query.toLowerCase());
    const f = filter === "All tasks" || (filter === "Overdue" ? t.status !== "Completed" && daysLeft(t.dueDate) < 0 : t.status === filter);
    const v = view === "My tasks" ? t.status !== "Completed" : true;
    return match && f && v;
  }).sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999")), [tasks, query, filter, view]);

  function saveTask(data: Omit<Task, "id" | "createdAt" | "updates">, id?: string) {
    if (id) setTasks(old => old.map(t => t.id === id ? { ...t, ...data } : t));
    else setTasks(old => [{ ...data, id: uid(), createdAt: new Date().toISOString(), updates: [] }, ...old]);
    setModal(false); setEditing(null);
  }
  function updateProgress(task: Task, progress: number, note: string) {
    const status: Status = progress === 100 ? "Completed" : progress > 0 ? "In progress" : "Not started";
    const update = { id: uid(), text: note || `Progress updated to ${progress}%.`, progress, date: new Date().toISOString() };
    setTasks(old => old.map(t => t.id === task.id ? { ...t, progress, status, updates: [update, ...t.updates] } : t));
    setSelected(s => s?.id === task.id ? { ...task, progress, status, updates: [update, ...task.updates] } : s);
  }
  function removeTask(id: string) { setTasks(old => old.filter(t => t.id !== id)); setSelected(null); }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={19}/></div><span>taskflow</span></div>
      <div className="workspace"><div className="avatar">A</div><div><b>My workspace</b><small>Personal space</small></div><ChevronDown size={15}/></div>
      <p className="nav-label">WORKSPACE</p>
      <button className={`nav-item ${view === "Overview" ? "active" : ""}`} onClick={() => setView("Overview")}><LayoutDashboard size={18}/> Overview</button>
      <button className={`nav-item ${view === "My tasks" ? "active" : ""}`} onClick={() => setView("My tasks")}><ListTodo size={18}/> My tasks <span className="nav-count">{tasks.filter(t => t.status !== "Completed").length}</span></button>
      <button className="nav-item" onClick={() => { setFilter("Completed"); setView("Overview"); }}><CheckCircle2 size={18}/> Completed</button>
      <div className="sidebar-bottom"><div className="tip-card"><div className="tip-icon"><Sparkles size={16}/></div><b>Small steps add up.</b><p>Keep your momentum going. Every update brings you closer to done.</p></div><div className="profile"><div className="avatar">A</div><div><b>Alex Morgan</b><small>Personal account</small></div><MoreHorizontal size={18}/></div></div>
    </aside>

    <main className="main">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{view}</b></div><div className="top-actions"><div className="today-label"><CalendarDays size={15}/>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div><button className="primary-btn small" onClick={() => { setEditing(null); setModal(true); }}><Plus size={16}/> New task</button></div></header>
      <section className="page-heading"><div><div className="eyebrow">YOUR PERSONAL PRODUCTIVITY SPACE</div><h1>{view === "Overview" ? "Good work starts here." : "Your tasks"}</h1><p>Stay focused, keep your plans moving, and make progress visible.</p></div><div className="heading-progress"><div className="progress-ring"><span>{overall}%</span></div><div><b>Overall progress</b><small>Across all your tasks</small></div></div></section>

      <section className="stats-grid">
        <Stat icon={<ListTodo size={18}/>} label="Total tasks" value={tasks.length} note="Tasks in your workspace" color="violet"/>
        <Stat icon={<Activity size={18}/>} label="In progress" value={active} note="Work currently moving" color="blue"/>
        <Stat icon={<CheckCircle2 size={18}/>} label="Completed" value={completed} note="Tasks across the finish line" color="green"/>
        <Stat icon={<Clock3 size={18}/>} label="Overdue" value={overdue} note="Need a little attention" color="orange"/>
      </section>

      <section className="task-section">
        <div className="section-head"><div><h2>Task overview</h2><p>A clear view of what needs your attention.</p></div><button className="primary-btn" onClick={() => { setEditing(null); setModal(true); }}><Plus size={17}/> Add a task</button></div>
        <div className="toolbar"><div className="searchbox"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks..." /></div><div className="filter-wrap"><SlidersHorizontal size={16}/><select value={filter} onChange={e => setFilter(e.target.value)}>{["All tasks", "Not started", "In progress", "Completed", "Overdue"].map(x => <option key={x}>{x}</option>)}</select><ChevronDown size={14}/></div></div>
        <div className="task-list">
          {visible.length ? visible.map(task => <TaskRow key={task.id} task={task} onOpen={() => setSelected(task)} onEdit={() => { setEditing(task); setModal(true); }} onComplete={() => updateProgress(task, 100, "Marked as completed.")}/>) : <div className="empty"><div className="empty-icon"><Target size={24}/></div><b>No tasks found</b><p>Try another filter or create a new task to get started.</p><button className="text-btn" onClick={() => { setFilter("All tasks"); setQuery(""); }}>Clear filters</button></div>}
        </div>
        <div className="list-footer">Showing <b>{visible.length}</b> of <b>{tasks.length}</b> tasks <span>•</span> Changes save automatically</div>
      </section>
      <footer>Made for focused work <span>✳</span> Your progress is saved in this browser.</footer>
    </main>

    {modal && <TaskModal task={editing} onClose={() => { setModal(false); setEditing(null); }} onSave={saveTask}/>}
    {selected && <DetailModal task={tasks.find(t => t.id === selected.id) || selected} onClose={() => setSelected(null)} onProgress={updateProgress} onEdit={() => { setEditing(tasks.find(t => t.id === selected.id) || selected); setSelected(null); setModal(true); }} onDelete={() => removeTask(selected.id)}/>}
  </div>;
}

function Stat({ icon, label, value, note, color }: { icon: React.ReactNode; label: string; value: number; note: string; color: string }) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}
function TaskRow({ task, onOpen, onEdit, onComplete }: { task: Task; onOpen: () => void; onEdit: () => void; onComplete: () => void }) {
  const left = daysLeft(task.dueDate);
  const dueText = !task.dueDate ? "No due date" : task.status === "Completed" ? `Due ${formatDate(task.dueDate)}` : left < 0 ? `${Math.abs(left)} days overdue` : left === 0 ? "Due today" : `Due ${formatDate(task.dueDate)}`;
  return <div className="task-row">
    <button className={`check-button ${task.status === "Completed" ? "checked" : ""}`} onClick={onComplete} title="Mark completed">{task.status === "Completed" ? <Check size={14}/> : <Circle size={19}/>}</button>
    <button className="task-main" onClick={onOpen}><span className={`task-title ${task.status === "Completed" ? "done" : ""}`}>{task.title}</span><span className="task-desc">{task.description || "No description added"}</span></button>
    <div className="task-progress"><div className="progress-label"><span>{task.progress}%</span><small>progress</small></div><div className="bar"><span style={{ width: `${task.progress}%` }}/></div></div>
    <div className="task-due"><CalendarDays size={14}/><span className={left < 0 && task.status !== "Completed" ? "late" : ""}>{dueText}</span></div>
    <span className={`priority ${task.priority.toLowerCase()}`}><i/>{task.priority}</span>
    <span className={`status ${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span>
    <button className="icon-button row-edit" onClick={onEdit} title="Edit task"><Pencil size={15}/></button>
  </div>;
}

function TaskModal({ task, onClose, onSave }: { task: Task | null; onClose: () => void; onSave: (data: Omit<Task, "id" | "createdAt" | "updates">, id?: string) => void }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<Priority>(task?.priority || "Medium");
  const [status, setStatus] = useState<Status>(task?.status || "Not started");
  const [startDate, setStartDate] = useState(task?.startDate || today);
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [progress, setProgress] = useState(task?.progress ?? 0);
  function submit(e: React.FormEvent) { e.preventDefault(); if (!title.trim()) return; onSave({ title: title.trim(), description, priority, status, startDate, dueDate, progress: status === "Completed" ? 100 : progress }, task?.id); }
  return <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><form className="modal" onSubmit={submit}><div className="modal-head"><div><div className="eyebrow">TASK DETAILS</div><h2>{task ? "Edit task" : "Create a task"}</h2></div><button type="button" className="icon-button" onClick={onClose}><X size={19}/></button></div>
    <label>Task name <input autoFocus required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Prepare project proposal"/></label>
    <label>Description <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this task involve?"/></label>
    <div className="form-grid"><label>Start date <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}/></label><label>Due date <input type="date" min={startDate} value={dueDate} onChange={e => setDueDate(e.target.value)}/></label></div>
    <div className="form-grid"><label>Priority <select value={priority} onChange={e => setPriority(e.target.value as Priority)}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Status <select value={status} onChange={e => { setStatus(e.target.value as Status); if (e.target.value === "Completed") setProgress(100); }}>{["Not started", "In progress", "Completed"].map(x => <option key={x}>{x}</option>)}</select></label></div>
    <label className="range-label">Progress <b>{progress}%</b><input type="range" min="0" max="100" step="5" value={progress} onChange={e => setProgress(Number(e.target.value))}/></label>
    <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" type="submit">{task ? "Save changes" : "Create task"}</button></div>
  </form></div>;
}

function DetailModal({ task, onClose, onProgress, onEdit, onDelete }: { task: Task; onClose: () => void; onProgress: (task: Task, progress: number, note: string) => void; onEdit: () => void; onDelete: () => void }) {
  const [progress, setProgress] = useState(task.progress);
  const [note, setNote] = useState("");
  return <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal detail-modal"><div className="modal-head"><div><div className="eyebrow">TASK DETAILS</div><h2>{task.title}</h2></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div>
    <p className="detail-description">{task.description || "No description added."}</p><div className="detail-meta"><span className={`priority ${task.priority.toLowerCase()}`}><i/>{task.priority} priority</span><span className={`status ${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span></div>
    <div className="date-strip"><div><small>START DATE</small><b>{formatDate(task.startDate)}</b></div><div><small>DUE DATE</small><b>{formatDate(task.dueDate)}</b></div><div><small>TIME LEFT</small><b>{task.status === "Completed" ? "Finished" : task.dueDate ? daysLeft(task.dueDate) < 0 ? `${Math.abs(daysLeft(task.dueDate))} days overdue` : `${daysLeft(task.dueDate)} days` : "—"}</b></div></div>
    <div className="update-box"><div className="update-heading"><b>Update progress</b><strong>{progress}%</strong></div><input type="range" min="0" max="100" step="5" value={progress} onChange={e => setProgress(Number(e.target.value))}/><textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note about what changed (optional)"/><button className="primary-btn full" onClick={() => { onProgress(task, progress, note); setNote(""); }}>Save progress update</button></div>
    <div className="activity-head"><b><Activity size={16}/> Activity timeline</b><span>{task.updates.length} updates</span></div>
    <div className="activity-list">{task.updates.length ? task.updates.map(u => <div className="activity-item" key={u.id}><div className="activity-dot"/><div><p>{u.text}</p><small>{new Date(u.date).toLocaleString()} · {u.progress}% complete</small></div></div>) : <p className="no-activity">No updates yet. Save a progress update to start the timeline.</p>}</div>
    <div className="modal-actions split"><button className="danger-btn" onClick={onDelete}><Trash2 size={15}/> Delete</button><div><button className="secondary-btn" onClick={onClose}>Close</button><button className="primary-btn" onClick={onEdit}><Pencil size={15}/> Edit task</button></div></div>
  </div></div>;
}
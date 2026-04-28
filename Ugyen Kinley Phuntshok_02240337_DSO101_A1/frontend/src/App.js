import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import './App.css';

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'var(--low)',    dot: '🟢' },
  medium: { label: 'Medium', color: 'var(--medium)', dot: '🟡' },
  high:   { label: 'High',   color: 'var(--high)',   dot: '🔴' },
};

const FILTERS = ['all', 'active', 'completed'];

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({ todo, onClose, onSave }) {
  const [title, setTitle]       = useState(todo?.title || '');
  const [desc, setDesc]         = useState(todo?.description || '');
  const [priority, setPriority] = useState(todo?.priority || 'medium');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title cannot be empty.'); return; }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), description: desc.trim(), priority, completed: todo?.completed ?? false });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{todo ? 'Edit Task' : 'New Task'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field">
            <label>Title <span className="required">*</span></label>
            <input
              autoFocus
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="What needs to be done?"
              maxLength={255}
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Add more details… (optional)"
              rows={3}
            />
          </div>
          <div className="field">
            <label>Priority</label>
            <div className="priority-selector">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  className={`priority-btn ${priority === key ? 'active' : ''}`}
                  style={{ '--p-color': cfg.color }}
                  onClick={() => setPriority(key)}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : todo ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── TodoCard ─────────────────────────────────────────────────────────────────
function TodoCard({ todo, onToggle, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const p = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.medium;
  const date = new Date(todo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(todo.id); } catch { setDeleting(false); }
  };

  return (
    <div className={`todo-card ${todo.completed ? 'completed' : ''} ${deleting ? 'deleting' : ''}`}>
      <button
        className={`check-btn ${todo.completed ? 'checked' : ''}`}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.completed && <span className="check-icon">✓</span>}
      </button>
      <div className="todo-body">
        <div className="todo-meta">
          <span className="priority-tag" style={{ color: p.color, borderColor: p.color }}>
            {p.label}
          </span>
          <span className="todo-date">{date}</span>
        </div>
        <h3 className="todo-title">{todo.title}</h3>
        {todo.description && <p className="todo-desc">{todo.description}</p>}
      </div>
      <div className="todo-actions">
        <button className="action-btn edit" onClick={() => onEdit(todo)} aria-label="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button className="action-btn delete" onClick={handleDelete} disabled={deleting} aria-label="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [todos, setTodos]       = useState([]);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modal, setModal]       = useState(null); // null | 'new' | todo-object

  const loadTodos = useCallback(async () => {
    try {
      setError('');
      const data = await api.getTodos();
      setTodos(data);
    } catch (err) {
      setError('Failed to connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTodos(); }, [loadTodos]);

  const handleSave = async (data) => {
    if (modal && modal.id) {
      const updated = await api.updateTodo(modal.id, data);
      setTodos(ts => ts.map(t => t.id === modal.id ? updated : t));
    } else {
      const created = await api.createTodo(data);
      setTodos(ts => [created, ...ts]);
    }
  };

  const handleToggle = async (id) => {
    const updated = await api.toggleTodo(id);
    setTodos(ts => ts.map(t => t.id === id ? updated : t));
  };

  const handleDelete = async (id) => {
    await api.deleteTodo(id);
    setTodos(ts => ts.filter(t => t.id !== id));
  };

  const filtered = todos.filter(t => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? !t.completed :
      t.completed;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  return (
    <div className="app">
      {/* Background */}
      <div className="bg-mesh" aria-hidden="true" />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">T</span>
            <span>Taskflow</span>
          </div>
          <div className="stats-row">
            <span className="stat"><strong>{stats.total}</strong> Total</span>
            <span className="stat-dot"/>
            <span className="stat"><strong>{stats.active}</strong> Active</span>
            <span className="stat-dot"/>
            <span className="stat"><strong>{stats.completed}</strong> Done</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search tasks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn-add" onClick={() => setModal('new')}>
            <span>+</span> Add Task
          </button>
        </div>

        {/* Content */}
        <div className="content">
          {loading && (
            <div className="state-msg">
              <div className="spinner" />
              <p>Loading tasks…</p>
            </div>
          )}
          {!loading && error && (
            <div className="state-msg error">
              <span className="state-icon">⚠</span>
              <p>{error}</p>
              <button className="btn-ghost" onClick={loadTodos}>Retry</button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="state-msg">
              <span className="state-icon">
                {search ? '🔍' : filter === 'completed' ? '🎉' : '📋'}
              </span>
              <p>{search ? 'No tasks match your search.' : filter === 'completed' ? 'No completed tasks yet.' : 'No tasks yet. Add one!'}</p>
              {!search && filter === 'all' && (
                <button className="btn-primary" onClick={() => setModal('new')}>Create first task</button>
              )}
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <div className="todo-list">
              {filtered.map(todo => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onEdit={(t) => setModal(t)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <Modal
          todo={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

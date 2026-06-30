import { create } from 'zustand';
import { apiFetch } from '../api/client';

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  assignee: string | null;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
}

interface FilterState {
  priority: string;
  assignee: string;
}

interface StoreState {
  user: User | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  
  setFilters: (filters: Partial<FilterState>) => void;
  clearError: () => void;
  
  fetchTasks: () => Promise<void>;
  createTask: (taskData: {
    title: string;
    description?: string;
    priority: TaskPriority;
    assignee?: string | null;
    dueDate: string;
    status: TaskStatus;
  }) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  tasks: [],
  loading: false,
  error: null,
  filters: {
    priority: 'All',
    assignee: 'All',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearError: () => set({ error: null }),

  initializeAuth: () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        set({ user: JSON.parse(savedUser) });
      } catch {
        localStorage.removeItem('user');
      }
    }
  },

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await apiFetch<Task[]>('/tasks');
      set({ tasks, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch tasks', loading: false });
    }
  },

  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const newTask = await apiFetch<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create task', loading: false });
      throw err;
    }
  },

  updateTask: async (id, updates) => {
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));

    try {
      const updated = await apiFetch<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (err: any) {
      set({ tasks: previousTasks, error: err.message || 'Failed to update task' });
      if (err.message && err.message.includes('Unauthorized')) {
        localStorage.removeItem('user');
        set({ user: null });
      }
      throw err;
    }
  },

  deleteTask: async (id) => {
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));

    try {
      await apiFetch(`/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      set({ tasks: previousTasks, error: err.message || 'Failed to delete task' });
      if (err.message && err.message.includes('Unauthorized')) {
        localStorage.removeItem('user');
        set({ user: null });
      }
      throw err;
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const user = await apiFetch<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', loading: false });
      throw err;
    }
  },

  register: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const user = await apiFetch<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('user');
      set({ user: null, loading: false });
    }
  },
}));

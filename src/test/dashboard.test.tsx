import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme/theme';
import { TaskFormView } from '../views/TaskFormView';
import { useStore } from '../store/useStore';

describe('Zustand Global Store & Local Selectors', () => {
  beforeEach(() => {
    useStore.setState({
      tasks: [],
      user: { id: 1, username: 'testuser' },
      filters: { priority: 'All', assignee: 'All' },
    });
  });

  it('should initialize with empty tasks list', () => {
    const state = useStore.getState();
    expect(state.tasks).toEqual([]);
  });

  it('should filter tasks locally by priority', () => {
    const sampleTasks = [
      {
        id: 1,
        title: 'Task A',
        description: 'Low priority',
        priority: 'Low' as const,
        assignee: 'Alice',
        dueDate: new Date().toISOString(),
        status: 'To Do' as const,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 2,
        title: 'Task B',
        description: 'High priority',
        priority: 'High' as const,
        assignee: 'Bob',
        dueDate: new Date().toISOString(),
        status: 'In Progress' as const,
        createdAt: '',
        updatedAt: '',
      },
    ];

    useStore.setState({ tasks: sampleTasks });

    // Set filter to High
    useStore.getState().setFilters({ priority: 'High' });

    const state = useStore.getState();
    const filtered = state.tasks.filter(
      (t) => state.filters.priority === 'All' || t.priority === state.filters.priority
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Task B');
  });

  it('should filter tasks locally by assignee', () => {
    const sampleTasks = [
      {
        id: 1,
        title: 'Task A',
        description: 'Alice task',
        priority: 'Low' as const,
        assignee: 'Alice',
        dueDate: new Date().toISOString(),
        status: 'To Do' as const,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 2,
        title: 'Task B',
        description: 'Bob task',
        priority: 'High' as const,
        assignee: 'Bob',
        dueDate: new Date().toISOString(),
        status: 'In Progress' as const,
        createdAt: '',
        updatedAt: '',
      },
    ];

    useStore.setState({ tasks: sampleTasks });

    // Set filter to Alice
    useStore.getState().setFilters({ assignee: 'Alice' });

    const state = useStore.getState();
    const filtered = state.tasks.filter(
      (t) => state.filters.assignee === 'All' || t.assignee === state.filters.assignee
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Task A');
  });
});

describe('TaskFormView UI Component', () => {
  beforeEach(() => {
    // Set mock user session so the component doesn't trigger auth redirect
    useStore.setState({
      user: { id: 1, username: 'testuser' },
      tasks: [],
    });
  });

  it('renders create form fields correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <TaskFormView />
        </BrowserRouter>
      </ThemeProvider>
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Assignee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/i)).toBeInTheDocument();
  });
});

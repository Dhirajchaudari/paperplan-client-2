import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useStore } from '../store/useStore';
import type { TaskStatus, TaskPriority } from '../store/useStore';

export function BoardView() {
  const navigate = useNavigate();
  const {
    user,
    tasks,
    loading,
    filters,
    setFilters,
    fetchTasks,
    updateTask,
    logout,
  } = useStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const assignees = Array.from(
    new Set(tasks.map((t) => t.assignee).filter((a): a is string => !!a))
  );

  const filteredTasks = tasks.filter((task) => {
    const priorityMatch =
      filters.priority === 'All' || task.priority === filters.priority;
    const assigneeMatch =
      filters.assignee === 'All' || task.assignee === filters.assignee;
    return priorityMatch && assigneeMatch;
  });

  const columns: { title: TaskStatus; status: TaskStatus }[] = [
    { title: 'To Do', status: 'To Do' },
    { title: 'In Progress', status: 'In Progress' },
    { title: 'Done', status: 'Done' },
  ];

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return { bg: '#fee2e2', text: '#ef4444' };
      case 'Medium':
        return { bg: '#ffedd5', text: '#f97316' };
      case 'Low':
        return { bg: '#d1fae5', text: '#10b981' };
      default:
        return { bg: '#e2e8f0', text: '#64748b' };
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (!user) {
      alert('You must be signed in to modify tasks');
      navigate('/login');
      return;
    }

    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId as TaskStatus;

    try {
      await updateTask(taskId, { status: newStatus });
    } catch {
      // Handled by store rollback
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Task Dashboard
          </Typography>
          {user ? (
            <Typography variant="body2" color="text.secondary">
              Logged in as <strong>{user.username}</strong>
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Viewing as Guest (Sign in to edit tasks)
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {user ? (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/new')}
              >
                New Task
              </Button>
              <IconButton onClick={() => logout()} title="Logout" color="error">
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 2.5, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 10px)', md: '250px' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => setFilters({ priority: e.target.value })}
              >
                <MenuItem value="All">All Priorities</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 10px)', md: '250px' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Assignee</InputLabel>
              <Select
                value={filters.assignee}
                label="Assignee"
                onChange={(e) => setFilters({ assignee: e.target.value })}
              >
                <MenuItem value="All">All Assignees</MenuItem>
                {assignees.map((assignee) => (
                  <MenuItem key={assignee} value={assignee}>
                    {assignee}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {loading && tasks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', flexDirection: { xs: 'column', md: 'row' } }}>
            {columns.map((col) => {
              const colTasks = filteredTasks.filter(
                (t) => t.status === col.status
              );

              return (
                <Box key={col.status} sx={{ flex: 1, minWidth: { xs: '100%', md: 'calc(33.33% - 16px)' }, display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 1.5,
                      py: 1,
                      mb: 2,
                      borderLeft: 4,
                      borderColor:
                        col.status === 'Done'
                          ? 'secondary.main'
                          : col.status === 'In Progress'
                          ? 'primary.main'
                          : 'text.secondary',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {col.title}
                    </Typography>
                    <Chip
                      label={colTasks.length}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  <Droppable droppableId={col.status}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          backgroundColor: snapshot.isDraggingOver
                            ? 'rgba(99, 102, 241, 0.05)'
                            : 'transparent',
                          border: '1px dashed',
                          borderColor: snapshot.isDraggingOver
                            ? 'primary.main'
                            : 'transparent',
                          borderRadius: 3,
                          p: 1,
                          minHeight: '500px',
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        {colTasks.map((task, index) => {
                          const pColor = getPriorityColor(task.priority);
                          return (
                            <Draggable
                              key={task.id}
                              draggableId={task.id.toString()}
                              index={index}
                            >
                              {(draggableProvided, draggableSnapshot) => (
                                <Card
                                  ref={draggableProvided.innerRef}
                                  {...draggableProvided.draggableProps}
                                  {...draggableProvided.dragHandleProps}
                                  onClick={() => navigate(`/tasks/${task.id}`)}
                                  sx={{
                                    mb: 2,
                                    cursor: 'pointer',
                                    transform: draggableSnapshot.isDragging
                                      ? 'rotate(2deg)'
                                      : 'none',
                                    '&:hover': {
                                      boxShadow:
                                        '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
                                      borderColor: 'primary.light',
                                    },
                                    transition: 'box-shadow 0.2s, border-color 0.2s',
                                  }}
                                >
                                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 1.5,
                                      }}
                                    >
                                      <Chip
                                        label={task.priority}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.7rem',
                                          fontWeight: 700,
                                          backgroundColor: pColor.bg,
                                          color: pColor.text,
                                        }}
                                      />
                                      
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CalendarTodayIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          {formatDate(task.dueDate)}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontWeight: 700, mb: 0.5 }}
                                    >
                                      {task.title}
                                    </Typography>
                                    
                                    {task.description && (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                          mb: 2,
                                          display: '-webkit-box',
                                          WebkitLineBreak: 'auto',
                                          WebkitBoxOrient: 'vertical',
                                          WebkitLineClamp: 2,
                                          overflow: 'hidden',
                                        }}
                                      >
                                        {task.description}
                                      </Typography>
                                    )}

                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mt: 1.5,
                                      }}
                                    >
                                      <Typography variant="caption" color="text.secondary">
                                        {task.assignee ? `Assignee: ${task.assignee}` : 'Unassigned'}
                                      </Typography>
                                      
                                      <Avatar
                                        sx={{
                                          width: 24,
                                          height: 24,
                                          fontSize: '0.65rem',
                                          fontWeight: 700,
                                          bgcolor: 'primary.dark',
                                        }}
                                      >
                                        {getInitials(task.assignee)}
                                      </Avatar>
                                    </Box>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Box>
              );
            })}
          </Box>
        </DragDropContext>
      )}
    </Container>
  );
}

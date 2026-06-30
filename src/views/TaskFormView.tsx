import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useStore } from '../store/useStore';
import type { TaskPriority, TaskStatus } from '../store/useStore';

export function TaskFormView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const {
    user,
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
  } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isEditMode && tasks.length > 0) {
      const task = tasks.find((t) => t.id === parseInt(id!, 10));
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setAssignee(task.assignee || '');
        
        try {
          const date = new Date(task.dueDate);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          setDueDate(`${yyyy}-${mm}-${dd}`);
        } catch {
          setDueDate('');
        }
        
        setStatus(task.status);
      } else {
        setErrorMsg('Task not found');
      }
    }
  }, [id, isEditMode, tasks]);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setErrorMsg('title is required');
      return false;
    }

    if (!dueDate) {
      setErrorMsg('dueDate is required');
      return false;
    }

    const selectedDate = new Date(dueDate);
    if (isNaN(selectedDate.getTime())) {
      setErrorMsg('dueDate must be a valid ISO date');
      return false;
    }

    if (!isEditMode) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate.getTime() < today.getTime()) {
        setErrorMsg('dueDate cannot be in the past');
        return false;
      }
    }

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateForm()) return;

    const isoDueDate = new Date(dueDate).toISOString();

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assignee.trim() || null,
      dueDate: isoDueDate,
      status,
    };

    try {
      if (isEditMode) {
        await updateTask(parseInt(id!, 10), taskPayload);
      } else {
        await createTask(taskPayload);
      }
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save task');
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    if (!isEditMode) return;

    try {
      await deleteTask(parseInt(id!, 10));
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete task');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
        color="inherit"
      >
        Back to Board
      </Button>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSave}>
            <TextField
              label="Title"
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2.5 }}
              disabled={loading}
              required
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2.5 }}
              disabled={loading}
            />

            <Box sx={{ display: 'flex', gap: 2.5, mb: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priority}
                    label="Priority"
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    disabled={loading}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    disabled={loading}
                  >
                    <MenuItem value="To Do">To Do</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Done">Done</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <TextField
              label="Assignee"
              fullWidth
              variant="outlined"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              sx={{ mb: 2.5 }}
              disabled={loading}
              placeholder="e.g. John Doe"
            />

            <TextField
              label="Due Date"
              type="date"
              fullWidth
              variant="outlined"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              sx={{ mb: 4 }}
              slotProps={{ inputLabel: { shrink: true } }}
              disabled={loading}
              required
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              {isEditMode ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={loading}
                >
                  Delete
                </Button>
              ) : (
                <Box />
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={loading}
                  color="inherit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

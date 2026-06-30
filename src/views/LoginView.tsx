import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useStore } from '../store/useStore';

export function LoginView() {
  const navigate = useNavigate();
  const { login, register, loading, error, clearError } = useStore();
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!username || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (tab === 1 && password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      if (tab === 0) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate('/');
    } catch {
      // Handled by store
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 4,
              pb: 2,
              background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
            }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                p: 1.5,
                mb: 1.5,
              }}
            >
              <LockOutlinedIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>
              Paper Plane Task
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }}>
              Manage your tasks efficiently
            </Typography>
          </Box>

          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Sign In" sx={{ fontWeight: 600 }} />
            <Tab label="Register" sx={{ fontWeight: 600 }} />
          </Tabs>

          <CardContent sx={{ p: 3 }}>
            {(error || localError) && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {localError || error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                fullWidth
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2.5 }}
                disabled={loading}
                autoFocus
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: tab === 1 ? 2.5 : 3.5 }}
                disabled={loading}
              />

              {tab === 1 && (
                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ mb: 3.5 }}
                  disabled={loading}
                />
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : tab === 0 ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

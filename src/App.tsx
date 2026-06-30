import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { theme } from './theme/theme';
import { useStore } from './store/useStore';
import { BoardView } from './views/BoardView';
import { TaskFormView } from './views/TaskFormView';
import { LoginView } from './views/LoginView';

function App() {
  const { initializeAuth, error, clearError } = useStore();

  // Load user session from localStorage on startup
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Main Board view */}
          <Route path="/" element={<BoardView />} />
          
          {/* Auth view */}
          <Route path="/login" element={<LoginView />} />
          
          {/* Task form routes */}
          <Route path="/new" element={<TaskFormView />} />
          <Route path="/tasks/:id" element={<TaskFormView />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Global error feedback popup */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={clearError}
          severity="error"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;

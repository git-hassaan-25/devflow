import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Typography,
  Link,
  Divider,
  Button,
  Collapse,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import { useSnackbar } from 'notistack';

import { useAuth } from '../hooks/useAuth.js';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Login() {
  const [email, setEmail] = useState('demo@devflow.local');
  const [password, setPassword] = useState('demo123456');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      enqueueSnackbar('Welcome back!', { variant: 'success' });
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@devflow.local');
    setPassword('demo123456');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your workspace."
      side={{
        headline: 'Pick up right where you left off.',
        body: 'Your projects, tasks, and teammates — all waiting in your DevFlow studio.',
      }}
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <Collapse in={Boolean(error)}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Collapse>

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Password"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPw((v) => !v)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPw ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={loading}
          loadingPosition="start"
          startIcon={<LoginRoundedIcon />}
          fullWidth
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </LoadingButton>

        <Divider sx={{ my: 1 }}>
          <Typography variant="caption" color="text.secondary">OR</Typography>
        </Divider>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<AutoFixHighRoundedIcon />}
          onClick={fillDemo}
        >
          Use demo credentials
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
          Don&rsquo;t have an account?{' '}
          <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 600 }}>
            Create one
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}

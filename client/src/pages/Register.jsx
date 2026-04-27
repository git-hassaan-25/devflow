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
  Box,
  LinearProgress,
  Collapse,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { useSnackbar } from 'notistack';

import { useAuth } from '../hooks/useAuth.js';
import AuthLayout from '../components/AuthLayout.jsx';

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Okay', 'Strong', 'Excellent'];
const STRENGTH_COLORS = ['error', 'warning', 'warning', 'info', 'success'];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const score = passwordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      enqueueSnackbar('Account created — welcome to DevFlow!', { variant: 'success' });
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start organizing your projects in seconds."
      side={{
        headline: 'A workspace that grows with your team.',
        body: 'Spin up projects, invite collaborators, and ship work on a real-time Kanban board.',
      }}
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <Collapse in={Boolean(error)}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Collapse>

        <TextField
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

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

        <Box>
          <TextField
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            helperText="Minimum 6 characters."
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
          {password && (
            <Box sx={{ mt: 1, px: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={(score / 4) * 100}
                color={STRENGTH_COLORS[score]}
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color={`${STRENGTH_COLORS[score]}.main`} sx={{ mt: 0.5, display: 'block' }}>
                {STRENGTH_LABELS[score]}
              </Typography>
            </Box>
          )}
        </Box>

        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={loading}
          loadingPosition="start"
          startIcon={<PersonAddAlt1RoundedIcon />}
          fullWidth
        >
          {loading ? 'Creating account…' : 'Create account'}
        </LoadingButton>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  Fade,
} from '@mui/material';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';

import { useAuth } from '../hooks/useAuth.js';
import api from '../api/axios.js';
import FullPageLoader from '../components/FullPageLoader.jsx';

const FEATURES = [
  { icon: <ViewKanbanRoundedIcon />, title: 'Kanban Boards', desc: 'Drag-and-drop task flow with todo / in-progress / done columns.' },
  { icon: <BoltRoundedIcon />,        title: 'Real-time Sync', desc: 'Socket.IO keeps every collaborator instantly in sync.' },
  { icon: <GroupsRoundedIcon />,      title: 'Team Projects',  desc: 'Owner + members per project with secure JWT auth.' },
];

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ state: 'checking', message: 'Checking API…' });

  useEffect(() => {
    let cancelled = false;
    api.get('/health')
      .then((res) => !cancelled && setStatus({ state: 'ok', message: res.data.message || 'API healthy' }))
      .catch(() => !cancelled && setStatus({ state: 'down', message: 'API unreachable' }));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loading && user) navigate('/projects', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return <FullPageLoader label="Loading" minHeight="100vh" />;
  if (user) return null;

  const statusChip = {
    checking: { color: 'default', icon: <CircularProgress size={14} thickness={5} /> },
    ok:       { color: 'success', icon: <CheckCircleRoundedIcon /> },
    down:     { color: 'error',   icon: <ErrorRoundedIcon /> },
  }[status.state];

  return (
    <Fade in timeout={400}>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 6, md: 10 } }}>
          <Stack alignItems="center" spacing={3} textAlign="center">
            <Chip
              icon={<RocketLaunchRoundedIcon />}
              label="MERN · React · Node · MongoDB"
              variant="outlined"
              color="primary"
              sx={{ borderRadius: 999, px: 0.5, letterSpacing: '0.06em' }}
            />

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.6rem', md: '4.25rem' },
                lineHeight: 1.05,
                color: 'primary.dark',
                maxWidth: 900,
              }}
            >
              Plan, ship, and collaborate <br />
              <Box component="span" sx={{ color: 'secondary.dark', fontStyle: 'italic' }}>
                with classic clarity.
              </Box>
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, fontSize: '1.1rem' }}>
              DevFlow is a modern task-management studio — Trello&rsquo;s simplicity, Notion&rsquo;s polish,
              Jira&rsquo;s structure. Organize projects and run your day on a real-time Kanban board.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
              <Button
                size="large"
                variant="contained"
                color="primary"
                startIcon={<LoginRoundedIcon />}
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                size="large"
                variant="outlined"
                color="primary"
                startIcon={<PersonAddAlt1RoundedIcon />}
                onClick={() => navigate('/register')}
              >
                Create account
              </Button>
            </Stack>

            <Chip
              size="small"
              variant="outlined"
              color={statusChip.color}
              icon={statusChip.icon}
              label={`API · ${status.message}`}
              sx={{ mt: 1 }}
            />
          </Stack>

          <Divider sx={{ my: { xs: 6, md: 9 } }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.2em' }}>
              What&rsquo;s inside
            </Typography>
          </Divider>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{ '& > *': { flex: 1 } }}
          >
            {FEATURES.map((f) => (
              <Paper
                key={f.title}
                elevation={0}
                sx={{
                  p: 3,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  borderRadius: 3,
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 28px rgba(15,31,54,0.08)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44, height: 44, borderRadius: 2,
                    display: 'grid', placeItems: 'center', mb: 2,
                    background: (t) => `${t.palette.primary.main}14`,
                    color: 'primary.main',
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 0.5 }}>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
              </Paper>
            ))}
          </Stack>

          <Paper
            elevation={0}
            sx={{
              mt: { xs: 6, md: 9 },
              p: 3,
              borderRadius: 3,
              border: (t) => `1px dashed ${t.palette.divider}`,
              background: (t) => `${t.palette.secondary.main}10`,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.16em' }}>
              DEMO CREDENTIALS
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <code>demo@devflow.local</code> &nbsp;·&nbsp; <code>demo123456</code>
            </Typography>
          </Paper>
        </Container>

        <Box component="footer" sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="caption">© {new Date().getFullYear()} DevFlow · Built with React + Node</Typography>
        </Box>
      </Box>
    </Fade>
  );
}

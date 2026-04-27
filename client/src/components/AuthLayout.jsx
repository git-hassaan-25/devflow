import { Box, Container, Paper, Typography, Stack, Chip } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import { useNavigate } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, side }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
        background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 60%, ${t.palette.primary.light} 100%)`,
      }}
    >
      {/* Left – brand panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'common.white',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 60%), radial-gradient(circle at 80% 80%, rgba(200,155,60,0.18), transparent 55%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ cursor: 'pointer', position: 'relative' }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 38, height: 38, borderRadius: 2,
              display: 'grid', placeItems: 'center',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <DashboardRoundedIcon fontSize="small" />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 }}
          >
            DevFlow
          </Typography>
        </Stack>

        <Box sx={{ position: 'relative', maxWidth: 460 }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: { md: '2.6rem', lg: '3.2rem' },
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            {side?.headline ?? 'Bring order to every sprint.'}
          </Typography>
          <Typography sx={{ opacity: 0.85, fontSize: '1.05rem' }}>
            {side?.body ?? 'A modern, classic workspace for managing projects, tasks, and teams — built end-to-end on the MERN stack.'}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <Chip label="Real-time" size="small" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} variant="outlined" />
            <Chip label="JWT auth" size="small" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} variant="outlined" />
            <Chip label="Kanban"   size="small" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} variant="outlined" />
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.6, position: 'relative' }}>
          © {new Date().getFullYear()} DevFlow Studio
        </Typography>
      </Box>

      {/* Right – form panel */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4, md: 6 },
          background: (t) => t.palette.background.default,
        }}
      >
        <Container maxWidth="xs" disableGutters>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: '0 18px 50px rgba(15,31,54,0.08)',
            }}
          >
            <Typography variant="h4" sx={{ mb: 0.5, color: 'primary.dark' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {subtitle}
              </Typography>
            )}
            {children}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

import { Box, CircularProgress, Typography, Fade } from '@mui/material';

export default function FullPageLoader({ label = 'Loading', minHeight = '60vh' }) {
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          minHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={40} thickness={4} color="primary" />
        <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
          {label.toUpperCase()}
        </Typography>
      </Box>
    </Fade>
  );
}

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

export default function EditProjectModal({ project, onSave, onCancel, loading }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
    }
  }, [project]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() });
  };

  return (
    <Dialog
      open={Boolean(project)}
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        noValidate: true,
        onSubmit: handleSubmit,
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pr: 7 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 2,
              display: 'grid', placeItems: 'center',
              background: (t) => `${t.palette.primary.main}14`,
              color: 'primary.main',
            }}
          >
            <EditNoteRoundedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>Edit project</Typography>
            <Typography variant="caption" color="text.secondary">
              Rename or update the description.
            </Typography>
          </Box>
        </Stack>
        <IconButton
          aria-label="close"
          onClick={onCancel}
          disabled={loading}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            placeholder="What is this project about?"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button type="button" onClick={onCancel} disabled={loading} color="inherit">
          Cancel
        </Button>
        <LoadingButton
          type="button"
          variant="contained"
          loading={loading}
          loadingPosition="start"
          startIcon={<SaveRoundedIcon />}
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          {loading ? 'Saving…' : 'Save changes'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

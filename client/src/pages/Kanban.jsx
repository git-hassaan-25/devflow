import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  IconButton,
  Paper,
  Card,
  TextField,
  Chip,
  Tooltip,
  Skeleton,
  Fade,
  Divider,
  alpha,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { useSnackbar } from 'notistack';

import { useSocket } from '../hooks/useSocket.js';
import api from '../api/axios.js';
import Navbar from '../components/Navbar.jsx';

const COLUMNS = [
  { id: 'todo',        label: 'To do',        icon: <RadioButtonUncheckedRoundedIcon fontSize="small" />, color: 'info' },
  { id: 'in-progress', label: 'In progress',  icon: <HourglassTopRoundedIcon fontSize="small" />,         color: 'warning' },
  { id: 'done',        label: 'Done',         icon: <TaskAltRoundedIcon fontSize="small" />,              color: 'success' },
];

export default function Kanban() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  useSocket(projectId, {
    onTaskCreated: (task) => {
      setTasks((prev) => (prev.find((t) => t._id === task._id) ? prev : [...prev, task]));
    },
    onTaskUpdated: (updated) => {
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    },
    onTaskDeleted: ({ _id }) => {
      setTasks((prev) => prev.filter((t) => t._id !== _id));
    },
  });

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      enqueueSnackbar('Failed to load project', { variant: 'error' });
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?project=${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      enqueueSnackbar('Failed to load tasks', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setAdding(true);
    try {
      const res = await api.post('/tasks', {
        title: newTask.trim(),
        project: projectId,
      });
      setTasks((prev) => (prev.find((t) => t._id === res.data._id) ? prev : [...prev, res.data]));
      setNewTask('');
    } catch (err) {
      console.error('Failed to create task:', err);
      enqueueSnackbar('Failed to create task', { variant: 'error' });
    } finally {
      setAdding(false);
    }
  };

  const handleDragStart = (task) => setDraggedTask(task);
  const handleDragEnd = () => { setDraggedTask(null); setDropTarget(null); };
  const handleDragOver = (e, status) => { e.preventDefault(); if (dropTarget !== status) setDropTarget(status); };
  const handleDragLeave = (status) => { if (dropTarget === status) setDropTarget(null); };

  const handleDrop = async (status) => {
    setDropTarget(null);
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }
    const original = draggedTask;
    setTasks((prev) => prev.map((t) => (t._id === original._id ? { ...t, status } : t)));
    setDraggedTask(null);
    try {
      await api.put(`/tasks/${original._id}`, { status });
    } catch (err) {
      console.error('Failed to update task:', err);
      enqueueSnackbar('Failed to move task', { variant: 'error' });
      setTasks((prev) => prev.map((t) => (t._id === original._id ? original : t)));
    }
  };

  const handleDeleteTask = async (taskId) => {
    const original = tasks.find((t) => t._id === taskId);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (err) {
      console.error('Failed to delete task:', err);
      enqueueSnackbar('Failed to delete task', { variant: 'error' });
      if (original) setTasks((prev) => [...prev, original]);
    }
  };

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Button
              variant="text"
              color="inherit"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate('/projects')}
              sx={{ color: 'text.secondary' }}
            >
              Projects
            </Button>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.18em' }}>
                BOARD
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: 'primary.dark', fontFamily: '"Playfair Display", Georgia, serif', lineHeight: 1.1 }}
              >
                {project?.name || <Skeleton width={220} />}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            {COLUMNS.map((col) => (
              <Chip
                key={col.id}
                size="small"
                color={col.color}
                variant="outlined"
                icon={col.icon}
                label={`${col.label} · ${getTasksByStatus(col.id).length}`}
              />
            ))}
          </Stack>
        </Stack>

        {/* Add task form */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleAddTask}
          sx={{
            p: 1.5,
            mb: 3,
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <TextField
            placeholder="Add a new task and press enter…"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              sx: { background: 'transparent' },
            }}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            loading={adding}
            loadingPosition="start"
            startIcon={<AddRoundedIcon />}
            disabled={!newTask.trim()}
            sx={{ minWidth: 140, flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            Add task
          </LoadingButton>
        </Paper>

        {/* Board */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2.5,
            alignItems: 'flex-start',
          }}
        >
          {COLUMNS.map((col) => {
            const colTasks = getTasksByStatus(col.id);
            const isOver = dropTarget === col.id;
            return (
              <Paper
                key={col.id}
                elevation={0}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => handleDragLeave(col.id)}
                onDrop={() => handleDrop(col.id)}
                sx={{
                  p: 2,
                  minHeight: 300,
                  borderRadius: 3,
                  border: (t) => `1px solid ${isOver ? t.palette[col.color].main : t.palette.divider}`,
                  background: (t) =>
                    isOver
                      ? alpha(t.palette[col.color].main, 0.06)
                      : `linear-gradient(180deg, ${t.palette.background.paper} 0%, ${t.palette.background.default} 100%)`,
                  transition: 'background 180ms ease, border-color 180ms ease',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Box sx={{ color: `${col.color}.main`, display: 'flex' }}>{col.icon}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1, color: 'text.primary' }}>
                    {col.label}
                  </Typography>
                  <Chip size="small" label={colTasks.length} sx={{ minWidth: 32 }} />
                </Stack>

                <Stack spacing={1.25} sx={{ minHeight: 60 }}>
                  {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} variant="rounded" height={70} />
                    ))
                  ) : colTasks.length === 0 ? (
                    <Box
                      sx={{
                        py: 4,
                        textAlign: 'center',
                        color: 'text.secondary',
                        border: (t) => `1px dashed ${t.palette.divider}`,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="caption">Drop tasks here</Typography>
                    </Box>
                  ) : (
                    colTasks.map((task) => (
                      <Fade in timeout={250} key={task._id}>
                        <Card
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          onDragEnd={handleDragEnd}
                          elevation={0}
                          sx={{
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            cursor: 'grab',
                            opacity: draggedTask?._id === task._id ? 0.5 : 1,
                            '&:active': { cursor: 'grabbing' },
                            '&:hover': {
                              borderColor: (t) => `${t.palette.primary.main}33`,
                              boxShadow: '0 6px 18px rgba(15,31,54,0.06)',
                            },
                          }}
                        >
                          <Box sx={{ color: 'text.disabled', pt: 0.25 }}>
                            <DragIndicatorRoundedIcon fontSize="small" />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                              {task.title}
                            </Typography>
                            {task.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {task.description}
                              </Typography>
                            )}
                          </Box>
                          <Tooltip title="Delete task">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTask(task._id)}
                              sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Card>
                      </Fade>
                    ))
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Box>
      </Container>
    </>
  );
}

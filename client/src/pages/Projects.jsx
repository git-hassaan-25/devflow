import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Typography,
  Chip,
  Paper,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Pagination,
  Fade,
  Divider,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import { useSnackbar } from 'notistack';

import api from '../api/axios.js';
import Navbar from '../components/Navbar.jsx';
import EditProjectModal from '../components/EditProjectModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const PAGE_SIZE = 6;

function ProjectCardSkeleton() {
  return (
    <Card elevation={0} sx={{ p: 2.5, height: 260, display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rounded" width={36} height={36} sx={{ mb: 1.5 }} />
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      <Box sx={{ flex: 1 }} />
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Skeleton variant="rounded" width={110} height={36} />
        <Skeleton variant="rounded" width={36} height={36} />
        <Skeleton variant="rounded" width={36} height={36} />
      </Stack>
    </Card>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProjects(page);
  }, [page]);

  const fetchProjects = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/projects?page=${currentPage}&limit=${PAGE_SIZE}`);
      setProjects(res.data.projects);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      enqueueSnackbar('Failed to load projects', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      await api.post('/projects', {
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
      });
      setNewProjectName('');
      setNewProjectDesc('');
      enqueueSnackbar('Project created', { variant: 'success' });
      fetchProjects(page);
    } catch (err) {
      console.error('Failed to create project:', err);
      enqueueSnackbar(err.response?.data?.message || 'Failed to create project', { variant: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/projects/${deletingProject._id}`);
      const newPage = projects.length === 1 && page > 1 ? page - 1 : page;
      enqueueSnackbar('Project deleted', { variant: 'info' });
      setDeletingProject(null);
      if (newPage !== page) setPage(newPage);
      else fetchProjects(newPage);
    } catch (err) {
      console.error('Failed to delete project:', err);
      enqueueSnackbar('Failed to delete project', { variant: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveProject = async (updates) => {
    if (!editingProject) return;
    setEditLoading(true);
    try {
      const res = await api.put(`/projects/${editingProject._id}`, updates);
      setProjects(projects.map((p) => (p._id === editingProject._id ? res.data : p)));
      setEditingProject(null);
      enqueueSnackbar('Project updated', { variant: 'success' });
    } catch (err) {
      console.error('Failed to update project:', err);
      enqueueSnackbar('Failed to update project', { variant: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'flex-end' }}
          justifyContent="space-between"
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.18em' }}>
              WORKSPACE
            </Typography>
            <Typography variant="h3" sx={{ color: 'primary.dark', fontFamily: '"Playfair Display", Georgia, serif' }}>
              My Projects
            </Typography>
          </Box>
          {pagination && (
            <Chip
              icon={<FolderOpenRoundedIcon />}
              label={`${pagination.total} ${pagination.total === 1 ? 'project' : 'projects'}`}
              variant="outlined"
              color="primary"
              sx={{ borderRadius: 999, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
            />
          )}
        </Stack>

        {/* Create form */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleCreateProject}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 4,
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            background: (t) => `linear-gradient(135deg, #fff 0%, ${t.palette.background.default} 100%)`,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', letterSpacing: '0.06em' }}>
            CREATE A NEW PROJECT
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
            <TextField
              label="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              required
              sx={{ flex: 1 }}
            />
            <TextField
              label="Description (optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              multiline
              maxRows={3}
              sx={{ flex: 1.5 }}
            />
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={creating}
              loadingPosition="start"
              startIcon={<AddRoundedIcon />}
              sx={{ minWidth: 160, alignSelf: { xs: 'stretch', md: 'flex-start' }, mt: { md: 0.5 } }}
            >
              Create
            </LoadingButton>
          </Stack>
        </Paper>

        {/* Project grid */}
        {loading || projects.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <ProjectCardSkeleton key={`sk-${i}`} />
                ))
              : projects.map((project) => (
                  <Fade in timeout={300} key={project._id} style={{ width: '100%' }}>
                    <Card
                      elevation={0}
                      sx={{
                        width: '100%',
                        height: 260,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 14px 30px rgba(15,31,54,0.08)',
                          borderColor: (t) => `${t.palette.primary.main}33`,
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: 0,
                          minHeight: 0,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            width: 38, height: 38, borderRadius: 2, mb: 1.5,
                            display: 'grid', placeItems: 'center',
                            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}18, ${t.palette.secondary.main}18)`,
                            color: 'primary.main',
                            flexShrink: 0,
                          }}
                        >
                          <FolderOpenRoundedIcon fontSize="small" />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 0.5,
                            color: 'primary.dark',
                            fontWeight: 700,
                            minWidth: 0,
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {project.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {project.description || 'No description provided.'}
                        </Typography>
                      </CardContent>
                      <Divider />
                      <CardActions sx={{ px: 2, py: 1.25, justifyContent: 'space-between' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          endIcon={<OpenInNewRoundedIcon />}
                          onClick={() => navigate(`/projects/${project._id}/kanban`)}
                        >
                          Open board
                        </Button>
                        <Stack direction="row">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => setEditingProject(project)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeletingProject(project)}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </CardActions>
                    </Card>
                  </Fade>
                ))}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 3,
              textAlign: 'center',
              border: (t) => `1px dashed ${t.palette.divider}`,
            }}
          >
            <InboxRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 0.5 }}>No projects yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first project above to get started.
            </Typography>
          </Paper>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Stack alignItems="center" sx={{ mt: 5 }}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </Stack>
        )}

        {/* Edit modal */}
        <EditProjectModal
          project={editingProject}
          onSave={handleSaveProject}
          onCancel={() => setEditingProject(null)}
          loading={editLoading}
        />

        {/* Delete confirm */}
        <ConfirmDialog
          open={Boolean(deletingProject)}
          title="Delete this project?"
          message={
            deletingProject
              ? `“${deletingProject.name}” and all of its tasks will be permanently removed. This cannot be undone.`
              : ''
          }
          confirmText="Delete"
          loading={deleteLoading}
          onCancel={() => !deleteLoading && setDeletingProject(null)}
          onConfirm={confirmDelete}
        />
      </Container>
    </>
  );
}

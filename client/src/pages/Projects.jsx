import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import Navbar from '../components/Navbar.jsx';
import EditProjectModal from '../components/EditProjectModal.jsx';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects(page);
  }, [page]);

  const fetchProjects = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/projects?page=${currentPage}&limit=6`);
      setProjects(res.data.projects);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await api.post('/projects', {
        name: newProjectName,
        description: newProjectDesc,
      });
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects(page); // refresh current page
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete project?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      // go to prev page if last item on page was deleted
      const newPage = projects.length === 1 && page > 1 ? page - 1 : page;
      setPage(newPage);
      fetchProjects(newPage);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleSaveProject = async (updates) => {
    if (!editingProject) return;
    setEditLoading(true);
    try {
      const res = await api.put(`/projects/${editingProject._id}`, updates);
      setProjects(projects.map((p) => p._id === editingProject._id ? res.data : p));
      setEditingProject(null);
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="projects-page">
        <div className="projects-header">
          <h2>My Projects</h2>
          {pagination && (
            <span className="projects-count">{pagination.total} projects</span>
          )}
        </div>

        <div className="create-form">
          <form onSubmit={handleCreateProject}>
            <input
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
            />
            <button type="submit">Create Project</button>
          </form>
        </div>

        <div className="projects-grid">
          {projects.length === 0 ? (
            <p className="empty">No projects yet. Create one to get started!</p>
          ) : (
            projects.map((project) => (
              <div key={project._id} className="project-card">
                <h3>{project.name}</h3>
                {project.description && <p>{project.description}</p>}
                <div className="project-actions">
                  <button className="open-btn" onClick={() => navigate(`/projects/${project._id}/kanban`)}>
                    Open Board
                  </button>
                  <button className="edit-btn" onClick={() => setEditingProject(project)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteProject(project._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
            >
              ← Prev
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
            >
              Next →
            </button>
          </div>
        )}

        {editingProject && (
          <EditProjectModal
            project={editingProject}
            onSave={handleSaveProject}
            onCancel={() => setEditingProject(null)}
            loading={editLoading}
          />
        )}
      </div>
    </>
  );
}
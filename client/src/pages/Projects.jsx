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
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await api.post('/projects', {
        name: newProjectName,
        description: newProjectDesc,
      });
      setProjects([...projects, res.data]);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete project?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
  };

  const handleSaveProject = async (updates) => {
    if (!editingProject) return;
    setEditLoading(true);
    try {
      const res = await api.put(`/projects/${editingProject._id}`, updates);
      setProjects(
        projects.map((p) =>
          p._id === editingProject._id ? res.data : p
        )
      );
      setEditingProject(null);
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="projects-page">
        <div className="projects-header">
          <h2>My Projects</h2>
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
                  <button
                    className="open-btn"
                    onClick={() => navigate(`/projects/${project._id}/kanban`)}
                  >
                    Open Board
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditProject(project)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteProject(project._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

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

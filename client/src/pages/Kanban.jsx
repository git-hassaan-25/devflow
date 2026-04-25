import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket.js";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";
import "./Kanban.css";

export default function Kanban() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);

  useSocket(projectId, {
    onTaskCreated: (task) => {
      setTasks((prev) => {
        // avoid duplicates if this client made the request
        if (prev.find((t) => t._id === task._id)) return prev;
        return [...prev, task];
      });
    },
    onTaskUpdated: (updated) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t)),
      );
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
      console.error("Failed to fetch project:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?project=${projectId}`);
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await api.post("/tasks", {
        title: newTask,
        project: projectId,
      });
      setTasks([...tasks, res.data]);
      setNewTask("");
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (status) => {
    if (!draggedTask) return;

    try {
      await api.put(`/tasks/${draggedTask._id}`, { status });
      setTasks(
        tasks.map((t) => (t._id === draggedTask._id ? { ...t, status } : t)),
      );
      setDraggedTask(null);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );

  return (
    <>
      <Navbar />
      <div className="kanban-page">
        <div className="kanban-header">
          <button onClick={() => navigate("/projects")} className="back-btn">
            ← Back to Projects
          </button>
          <h2>{project?.name}</h2>
        </div>

        <div className="kanban-input">
          <form onSubmit={handleAddTask}>
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>
        </div>

        <div className="kanban-board">
          {["todo", "in-progress", "done"].map((status) => (
            <div
              key={status}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status)}
            >
              <h3>{status.replace("-", " ").toUpperCase()}</h3>
              <div className="kanban-tasks">
                {getTasksByStatus(status).map((task) => (
                  <div
                    key={task._id}
                    className="kanban-task"
                    draggable
                    onDragStart={() => handleDragStart(task)}
                  >
                    <p>{task.title}</p>
                    {task.description && <small>{task.description}</small>}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

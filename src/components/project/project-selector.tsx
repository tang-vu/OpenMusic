/**
 * Project Selector Component
 * Dropdown to select, create, and manage projects
 */

import { useState } from 'react';
import { useProjectStore, type MusicProject } from '@/stores/project-store';
import { useLyricsStore } from '@/stores/lyrics-store';
import { useBeatsStore } from '@/stores/beats-store';

export function ProjectSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);

  const {
    projects,
    currentProjectId,
    createProject,
    deleteProject,
    loadProject,
    saveCurrentProject,
    setCurrentProject,
  } = useProjectStore();

  const { content: lyrics, setContent: setLyrics, clear: clearLyrics } = useLyricsStore();
  const { bpm, pattern, setBpm, setPattern, clear: clearBeats } = useBeatsStore();

  const currentProject = projects.find((p) => p.id === currentProjectId);

  // Save current state to project
  const handleSave = () => {
    if (currentProjectId) {
      saveCurrentProject({
        lyrics,
        beats: { bpm, pattern },
      });
    }
  };

  // Load project data into stores
  const handleLoadProject = (project: MusicProject) => {
    loadProject(project.id);
    setLyrics(project.data.lyrics);
    setBpm(project.data.beats.bpm);
    setPattern(project.data.beats.pattern);
    setIsOpen(false);
  };

  // Create new project
  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    // Save current first if exists
    if (currentProjectId) {
      handleSave();
    }

    // Create new and clear stores
    createProject(newProjectName.trim());
    clearLyrics();
    clearBeats();

    setNewProjectName('');
    setShowNewInput(false);
    setIsOpen(false);
  };

  // Delete project
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this project?')) {
      deleteProject(id);
      if (id === currentProjectId) {
        clearLyrics();
        clearBeats();
      }
    }
  };

  // Close project (go to no project state)
  const handleCloseProject = () => {
    if (currentProjectId) {
      handleSave();
    }
    setCurrentProject(null);
    clearLyrics();
    clearBeats();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Current Project Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface-700 hover:bg-surface-600 rounded-lg text-sm transition-colors"
      >
        <span className="text-gray-400">📁</span>
        <span className="text-white max-w-[150px] truncate">
          {currentProject?.name || 'No Project'}
        </span>
        <span className="text-gray-500">▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-50">
          {/* Project List */}
          <div className="max-h-48 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No projects yet
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleLoadProject(project)}
                  className={`flex items-center justify-between px-3 py-2 hover:bg-surface-700 cursor-pointer ${
                    project.id === currentProjectId ? 'bg-surface-700' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{project.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete project"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-surface-600 p-2 space-y-2">
            {showNewInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  placeholder="Project name..."
                  className="flex-1 px-2 py-1 bg-surface-700 border border-surface-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  autoFocus
                />
                <button
                  onClick={handleCreateProject}
                  className="px-2 py-1 bg-primary-500 text-white text-sm rounded hover:bg-primary-600"
                >
                  ✓
                </button>
                <button
                  onClick={() => setShowNewInput(false)}
                  className="px-2 py-1 bg-surface-600 text-white text-sm rounded hover:bg-surface-500"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewInput(true)}
                className="w-full px-3 py-1.5 text-sm text-primary-400 hover:bg-surface-700 rounded transition-colors"
              >
                + New Project
              </button>
            )}

            {currentProjectId && (
              <>
                <button
                  onClick={handleSave}
                  className="w-full px-3 py-1.5 text-sm text-green-400 hover:bg-surface-700 rounded transition-colors"
                >
                  💾 Save Project
                </button>
                <button
                  onClick={handleCloseProject}
                  className="w-full px-3 py-1.5 text-sm text-gray-400 hover:bg-surface-700 rounded transition-colors"
                >
                  Close Project
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

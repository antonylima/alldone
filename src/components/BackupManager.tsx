import { useState, useEffect } from 'react';
import { Database, Download, Trash2, RotateCcw, X } from 'lucide-react';
import { backupService } from '../services/backupService';
import type { Backup } from '../types/task';

interface BackupManagerProps {
  onClose: () => void;
  onRestoreComplete: () => void;
}

export function BackupManager({ onClose, onRestoreComplete }: BackupManagerProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await backupService.getAllBackups();
      setBackups(data);
    } catch (err) {
      setError('Failed to load backups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupName.trim()) return;

    try {
      setLoading(true);
      setError('');
      await backupService.createBackup(backupName.trim());
      setBackupName('');
      await loadBackups();
    } catch (err) {
      setError('Failed to create backup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!confirm('This will replace all current tasks with the backup. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await backupService.restoreBackup(backupId);
      onRestoreComplete();
      onClose();
    } catch (err) {
      setError('Failed to restore backup');
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (backupId: string) => {
    if (!confirm('Delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await backupService.deleteBackup(backupId);
      await loadBackups();
    } catch (err) {
      setError('Failed to delete backup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (backupId: string) => {
    try {
      await backupService.exportBackupAsJson(backupId);
    } catch (err) {
      setError('Failed to export backup');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Backup Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateBackup} className="mb-6">
            <label htmlFor="backupName" className="block text-sm font-medium text-gray-700 mb-2">
              Create New Backup
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="backupName"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="Enter backup name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !backupName.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </form>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Backups</h3>
            {loading && backups.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Loading backups...</p>
            ) : backups.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No backups available</p>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{backup.backup_name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Created: {new Date(backup.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tasks: {Array.isArray(backup.tasks_data) ? backup.tasks_data.length : 0}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(backup.id)}
                          disabled={loading}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                          title="Restore backup"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleExport(backup.id)}
                          disabled={loading}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                          title="Export as JSON"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(backup.id)}
                          disabled={loading}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Delete backup"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

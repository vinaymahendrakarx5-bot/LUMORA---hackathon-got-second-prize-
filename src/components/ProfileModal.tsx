import { useState } from 'react';
import { Check, UserPlus, X } from 'lucide-react';
import type { Board, Grade, UserProfile } from '../lib/types';

interface ProfileModalProps {
  users: UserProfile[];
  activeUser: UserProfile;
  onSelectUser: (userId: string) => void;
  onCreateUser: (payload: {
    name: string;
    grade: Grade;
    board: Board;
    role: 'student' | 'teacher';
  }) => Promise<void>;
  onClose: () => void;
}

export function ProfileModal({
  users,
  activeUser,
  onSelectUser,
  onCreateUser,
  onClose,
}: ProfileModalProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<Grade>(8);
  const [board, setBoard] = useState<Board>('CBSE');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a learner or teacher name.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await onCreateUser({ name: name.trim(), grade, board, role });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h2
            id="profile-modal-title"
            className="font-display text-lg font-bold text-zinc-50"
          >
            Switch or Create Learner Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile dialog"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Existing Profiles */}
        <div className="mt-4 space-y-2">
          <div className="text-xs font-medium text-zinc-400">
            Saved Profiles ({users.length})
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {users.map((u) => {
              const isCurrent = u.id === activeUser.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onSelectUser(u.id);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-500/10 text-zinc-50'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">{u.name}</div>
                    <div className="text-xs text-zinc-400">
                      {u.role === 'teacher' ? 'Teacher' : 'Student'} · {u.board}{' '}
                      · Class {u.grade}
                    </div>
                  </div>
                  {isCurrent && (
                    <Check className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Create New Profile */}
        <form
          onSubmit={handleCreate}
          className="mt-6 space-y-3 border-t border-zinc-800 pt-5"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <UserPlus className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span>Register New Profile</span>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-200"
            >
              {error}
            </div>
          )}

          <label className="block space-y-1 text-xs">
            <span className="text-zinc-400">Full Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rohan Verma"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block space-y-1 text-xs">
              <span className="text-zinc-400">Class</span>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as Grade)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs text-zinc-100"
              >
                {[5, 6, 7, 8, 9, 10].map((g) => (
                  <option key={g} value={g}>
                    Class {g}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-xs">
              <span className="text-zinc-400">Board</span>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value as Board)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs text-zinc-100"
              >
                <option value="CBSE">CBSE</option>
                <option value="SSC">SSC</option>
              </select>
            </label>

            <label className="block space-y-1 text-xs">
              <span className="text-zinc-400">Role</span>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as 'student' | 'teacher')
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs text-zinc-100"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            {creating ? 'Creating Profile...' : 'Create & Switch Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

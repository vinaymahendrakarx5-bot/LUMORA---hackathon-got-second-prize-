import { useEffect, useMemo, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import type { Concept, Course } from '../lib/types';
import { wouldCreateCycle } from '../lib/graph';

interface TeacherStudioProps {
  courses: Course[];
  concepts: Concept[];
  defaultCourseId: string;
  onCreateConcept: (payload: {
    courseId: string;
    title: string;
    chapter: string;
    summary: string;
    formula?: string;
    estimatedMinutes: number;
    prerequisites: string[];
  }) => Promise<void>;
  onUpdateConcept: (
    conceptId: string,
    payload: {
      title?: string;
      chapter?: string;
      summary?: string;
      formula?: string;
      estimatedMinutes?: number;
      prerequisites?: string[];
    },
  ) => Promise<void>;
}

export function TeacherStudio({
  courses,
  concepts,
  defaultCourseId,
  onCreateConcept,
  onUpdateConcept,
}: TeacherStudioProps) {
  const [courseId, setCourseId] = useState(defaultCourseId || courses[0]?.id || '');
  const [mode, setMode] = useState<'edit' | 'create'>('edit');
  const [selectedId, setSelectedId] = useState<string>('');

  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [summary, setSummary] = useState('');
  const [formula, setFormula] = useState('');
  const [minutes, setMinutes] = useState(20);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const courseConcepts = useMemo(
    () => concepts.filter((c) => c.courseId === courseId),
    [concepts, courseId],
  );

  useEffect(() => {
    if (mode === 'edit') {
      const target =
        courseConcepts.find((c) => c.id === selectedId) ?? courseConcepts[0];
      if (target) {
        setSelectedId(target.id);
        setTitle(target.title);
        setChapter(target.chapter);
        setSummary(target.summary);
        setFormula(target.formula ?? '');
        setMinutes(target.estimatedMinutes);
        setPrerequisites(target.prerequisites);
      }
    }
  }, [courseId, mode, selectedId, courseConcepts]);

  const handleStartCreate = () => {
    setMode('create');
    setTitle('');
    setChapter(`Ch ${courseConcepts.length + 1}`);
    setSummary('');
    setFormula('');
    setMinutes(20);
    setPrerequisites([]);
    setStatusMessage(null);
  };

  const togglePrereq = (pid: string) => {
    if (mode === 'edit' && selectedId) {
      if (!prerequisites.includes(pid) && wouldCreateCycle(courseConcepts, pid, selectedId)) {
        setStatusMessage({
          type: 'error',
          text: 'Cannot add this prerequisite because it would create a circular dependency.',
        });
        return;
      }
    }
    setStatusMessage(null);
    setPrerequisites((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Concept title is required.' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      if (mode === 'create') {
        await onCreateConcept({
          courseId,
          title: title.trim(),
          chapter: chapter.trim() || 'Unit',
          summary: summary.trim(),
          formula: formula.trim() || undefined,
          estimatedMinutes: minutes,
          prerequisites,
        });
        setStatusMessage({
          type: 'success',
          text: `Added "${title.trim()}" to the curriculum graph.`,
        });
        setMode('edit');
      } else if (selectedId) {
        await onUpdateConcept(selectedId, {
          title: title.trim(),
          chapter: chapter.trim(),
          summary: summary.trim(),
          formula: formula.trim(),
          estimatedMinutes: minutes,
          prerequisites,
        });
        setStatusMessage({
          type: 'success',
          text: `Saved changes to "${title.trim()}".`,
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-50">
            Teacher Curriculum Studio
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Edit concept details, adjust prerequisite dependencies, or author new nodes with cycle validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Course</span>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setSelectedId('');
                setStatusMessage(null);
              }}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleStartCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Concept</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Concept List */}
        <div className="lg:col-span-5 space-y-2">
          <h2 className="text-xs font-medium text-zinc-400">
            Course Concepts ({courseConcepts.length})
          </h2>
          <div className="space-y-2">
            {courseConcepts.map((c) => {
              const active = mode === 'edit' && selectedId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setMode('edit');
                    setSelectedId(c.id);
                    setStatusMessage(null);
                  }}
                  className={`flex w-full flex-col gap-1 rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    active
                      ? 'border-amber-400 bg-amber-500/10 text-zinc-50'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-mono">{c.chapter}</span>
                    <span className="font-mono tabular-nums">
                      {c.prerequisites.length} prereqs · {c.estimatedMinutes} min
                    </span>
                  </div>
                  <div className="text-sm font-semibold">{c.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Editor Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-6"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="font-display text-base font-semibold text-zinc-100">
                {mode === 'create' ? 'Create New Concept' : 'Edit Concept'}
              </h2>
              {mode === 'create' && (
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel New
                </button>
              )}
            </div>

            {statusMessage && (
              <div
                role="status"
                className={`rounded-lg border px-3.5 py-2.5 text-xs ${
                  statusMessage.type === 'success'
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                    : 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="sm:col-span-2 block space-y-1.5 text-xs">
                <span className="text-zinc-300 font-medium">Concept Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Quadratic Inequalities"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                />
              </label>

              <label className="block space-y-1.5 text-xs">
                <span className="text-zinc-300 font-medium">Chapter / Unit</span>
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="Ch 7"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                />
              </label>
            </div>

            <label className="block space-y-1.5 text-xs">
              <span className="text-zinc-300 font-medium">Concept Summary</span>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Explain what students master in this concept..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="sm:col-span-2 block space-y-1.5 text-xs">
                <span className="text-zinc-300 font-medium">
                  Key Formula / Principle (Optional)
                </span>
                <input
                  type="text"
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  placeholder="e.g., ax² + bx + c = 0"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                />
              </label>

              <label className="block space-y-1.5 text-xs">
                <span className="text-zinc-300 font-medium">
                  Study Time (min)
                </span>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm tabular-nums text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-zinc-300">
                Prerequisites (DAG Dependencies)
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {courseConcepts
                  .filter((c) => mode === 'create' || c.id !== selectedId)
                  .map((candidate) => {
                    const checked = prerequisites.includes(candidate.id);
                    return (
                      <label
                        key={candidate.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                          checked
                            ? 'border-amber-400/70 bg-amber-500/10 text-amber-100'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePrereq(candidate.id)}
                          className="accent-amber-400"
                        />
                        <span className="truncate">{candidate.title}</span>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {saving
                    ? 'Saving...'
                    : mode === 'create'
                      ? 'Create Concept'
                      : 'Save Changes'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

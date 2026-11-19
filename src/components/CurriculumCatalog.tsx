import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Board, Concept, Course, Grade, Subject } from '../lib/types';
import { calculateMasteryStats } from '../lib/graph';

interface CurriculumCatalogProps {
  courses: Course[];
  concepts: Concept[];
  masteredIds: Set<string>;
  onOpenCourse: (course: Course) => void;
}

export function CurriculumCatalog({
  courses,
  concepts,
  masteredIds,
  onOpenCourse,
}: CurriculumCatalogProps) {
  const [boardFilter, setBoardFilter] = useState<'ALL' | Board>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<'ALL' | Subject>('ALL');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | Grade>('ALL');

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (boardFilter !== 'ALL' && c.board !== boardFilter) return false;
      if (subjectFilter !== 'ALL' && c.subject !== subjectFilter) return false;
      if (gradeFilter !== 'ALL' && c.grade !== gradeFilter) return false;
      return true;
    });
  }, [courses, boardFilter, subjectFilter, gradeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-50">
            Classes 5th–10th Curriculum Catalog
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Browse all {courses.length} CBSE and SSC courses across Mathematics and Science.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Board</span>
            <select
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value as 'ALL' | Board)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <option value="ALL">All Boards</option>
              <option value="CBSE">CBSE</option>
              <option value="SSC">SSC</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Subject</span>
            <select
              value={subjectFilter}
              onChange={(e) =>
                setSubjectFilter(e.target.value as 'ALL' | Subject)
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <option value="ALL">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Class</span>
            <select
              value={String(gradeFilter)}
              onChange={(e) =>
                setGradeFilter(
                  e.target.value === 'ALL'
                    ? 'ALL'
                    : (Number(e.target.value) as Grade),
                )
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <option value="ALL">All Classes</option>
              {[5, 6, 7, 8, 9, 10].map((g) => (
                <option key={g} value={g}>
                  Class {g}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => {
          const courseConcepts = concepts.filter(
            (c) => c.courseId === course.id,
          );
          const stats = calculateMasteryStats(courseConcepts, masteredIds);

          return (
            <article
              key={course.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700"
            >
              <div>
                <div className="text-xs text-zinc-400">
                  {course.board} · Class {course.grade} · {course.subject}
                </div>
                <h2 className="mt-1.5 font-display text-lg font-semibold text-zinc-100">
                  {course.title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  {course.description}
                </p>
              </div>

              <div className="mt-5 space-y-3 border-t border-zinc-800/80 pt-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      <span className="font-mono tabular-nums text-zinc-200">
                        {stats.masteredCount}/{stats.totalCount}
                      </span>{' '}
                      concepts mastered
                    </span>
                    <span className="font-mono tabular-nums text-amber-300">
                      {stats.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenCourse(course)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs font-medium text-zinc-100 transition-colors hover:border-amber-500/60 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <span>Open Knowledge Map</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

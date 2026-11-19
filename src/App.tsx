import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api/client';
import { ConceptDeck } from './components/ConceptDeck';
import { CurriculumCatalog } from './components/CurriculumCatalog';
import { IntroAnimation } from './components/IntroAnimation';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { ProfileModal } from './components/ProfileModal';
import { TeacherStudio } from './components/TeacherStudio';
import { type ActiveTab, TopBar } from './components/TopBar';
import {
  calculateMasteryStats,
  computeConceptStatuses,
  computeShortestPath,
} from './lib/graph';
import type { Board, Concept, Course, Grade, StudyMessage, Subject, UserProfile } from './lib/types';

const STORAGE_USER_KEY = 'lumora_active_user_id';
const GRADES: Grade[] = [5, 6, 7, 8, 9, 10];
const BOARDS: Board[] = ['CBSE', 'SSC'];
const SUBJECTS: Subject[] = ['Mathematics', 'Science'];

export default function App() {
  const skipIntroInitially =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [showIntro, setShowIntro] = useState(!skipIntroInitially);
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile>({
    id: 'student-aarav',
    name: 'Aarav Sharma',
    role: 'student',
    grade: 8,
    board: 'CBSE',
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [masteredList, setMasteredList] = useState<string[]>([]);
  const [studyHistory, setStudyHistory] = useState<StudyMessage[]>([]);

  // Active workspace filters
  const [selectedGrade, setSelectedGrade] = useState<Grade>(8);
  const [selectedBoard, setSelectedBoard] = useState<Board>('CBSE');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics');

  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [targetConceptId, setTargetConceptId] = useState<string | null>(null);

  const loadBootstrap = useCallback(async (userId?: string, syncFilters = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.bootstrap(userId);
      setUsers(data.users);
      setActiveUser(data.activeUser);
      setCourses(data.courses);
      setConcepts(data.concepts);
      setMasteredList(data.masteredIds);
      setStudyHistory(data.studyHistory ?? []);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_USER_KEY, data.activeUser.id);
      }
      if (syncFilters) {
        setSelectedGrade(data.activeUser.grade);
        setSelectedBoard(data.activeUser.board);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedId =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_USER_KEY) ?? undefined
        : undefined;
    loadBootstrap(savedId, true);
  }, [loadBootstrap]);

  const activeCourse = useMemo(
    () =>
      courses.find(
        (c) =>
          c.grade === selectedGrade &&
          c.board === selectedBoard &&
          c.subject === selectedSubject,
      ),
    [courses, selectedGrade, selectedBoard, selectedSubject],
  );

  const courseConcepts = useMemo(() => {
    if (!activeCourse) return [];
    return concepts.filter((c) => c.courseId === activeCourse.id);
  }, [concepts, activeCourse]);

  // Keep selected concept and target goal valid when course switches
  useEffect(() => {
    if (courseConcepts.length === 0) {
      setSelectedConceptId(null);
      setTargetConceptId(null);
      return;
    }

    if (!courseConcepts.some((c) => c.id === selectedConceptId)) {
      setSelectedConceptId(courseConcepts[0].id);
    }
    if (
      targetConceptId &&
      !courseConcepts.some((c) => c.id === targetConceptId)
    ) {
      setTargetConceptId(null);
    }
  }, [courseConcepts, selectedConceptId, targetConceptId]);

  const masteredSet = useMemo(() => new Set(masteredList), [masteredList]);

  const statusMap = useMemo(
    () => computeConceptStatuses(courseConcepts, masteredSet),
    [courseConcepts, masteredSet],
  );

  const masteryStats = useMemo(
    () => calculateMasteryStats(courseConcepts, masteredSet),
    [courseConcepts, masteredSet],
  );

  const shortestPath = useMemo(() => {
    if (!targetConceptId) {
      return {
        orderedConceptIds: [] as string[],
        edgeKeys: new Set<string>(),
        totalMinutes: 0,
      };
    }
    return computeShortestPath(courseConcepts, targetConceptId, masteredSet);
  }, [courseConcepts, targetConceptId, masteredSet]);

  const selectedConcept = useMemo(
    () => courseConcepts.find((c) => c.id === selectedConceptId) ?? null,
    [courseConcepts, selectedConceptId],
  );

  const handleToggleMastery = async (conceptId: string, mastered: boolean) => {
    const res = await api.toggleMastery({
      userId: activeUser.id,
      conceptId,
      mastered,
    });
    setMasteredList(res.masteredIds);
  };

  const handleSubmitQuiz = async (conceptId: string, answers: number[]) => {
    const res = await api.submitQuiz({
      userId: activeUser.id,
      conceptId,
      answers,
    });
    setMasteredList(res.masteredIds);
    return { attempt: res.attempt, results: res.results };
  };

  const handleAskAiStudy = async (conceptId: string, prompt: string) => {
    const res = await api.askAiStudy({
      userId: activeUser.id,
      conceptId,
      prompt,
    });
    setStudyHistory((prev) => [...prev, ...res.messages]);
  };

  const handleCreateConcept = async (payload: {
    courseId: string;
    title: string;
    chapter: string;
    summary: string;
    formula?: string;
    estimatedMinutes: number;
    prerequisites: string[];
  }) => {
    const { concept } = await api.createConcept(payload);
    setConcepts((prev) => [...prev, concept]);
  };

  const handleUpdateConcept = async (
    conceptId: string,
    payload: {
      title?: string;
      chapter?: string;
      summary?: string;
      formula?: string;
      estimatedMinutes?: number;
      prerequisites?: string[];
    },
  ) => {
    const { concept } = await api.updateConcept(conceptId, payload);
    setConcepts((prev) => prev.map((c) => (c.id === concept.id ? concept : c)));
  };

  const handleSelectUser = (userId: string) => {
    loadBootstrap(userId, true);
  };

  const handleCreateUser = async (payload: {
    name: string;
    grade: Grade;
    board: Board;
    role: 'student' | 'teacher';
  }) => {
    const { user } = await api.createUser(payload);
    await loadBootstrap(user.id, true);
  };

  const handleOpenCourseFromCatalog = (course: Course) => {
    setSelectedGrade(course.grade);
    setSelectedBoard(course.board);
    setSelectedSubject(course.subject);
    setTargetConceptId(null);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}

      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onReplayIntro={() => setShowIntro(true)}
        activeUser={activeUser}
        onOpenProfileModal={() => setProfileModalOpen(true)}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40">
            <p className="text-sm text-zinc-400">
              Loading prerequisite learning maps...
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-6 text-sm text-rose-200"
          >
            <p className="font-semibold">Failed to load curriculum data</p>
            <p className="mt-1 text-xs text-rose-300">{error}</p>
            <button
              type="button"
              onClick={() => loadBootstrap(activeUser.id)}
              className="mt-3 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950"
            >
              Retry
            </button>
          </div>
        ) : activeTab === 'catalog' ? (
          <CurriculumCatalog
            courses={courses}
            concepts={concepts}
            masteredIds={masteredSet}
            onOpenCourse={handleOpenCourseFromCatalog}
          />
        ) : activeTab === 'teacher' ? (
          <TeacherStudio
            courses={courses}
            concepts={concepts}
            defaultCourseId={activeCourse?.id ?? courses[0]?.id ?? ''}
            onCreateConcept={handleCreateConcept}
            onUpdateConcept={handleUpdateConcept}
          />
        ) : (
          <div className="space-y-5">
            {/* Course Filter & Shortest-Path Goal Bar */}
            <section
              aria-label="Curriculum controls and mastery summary"
              className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* Grade Selector */}
                <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setSelectedGrade(g);
                        setTargetConceptId(null);
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        selectedGrade === g
                          ? 'bg-amber-500 text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      {g}th
                    </button>
                  ))}
                </div>

                {/* Board Segmented Control */}
                <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                  {BOARDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setSelectedBoard(b);
                        setTargetConceptId(null);
                      }}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        selectedBoard === b
                          ? 'bg-zinc-800 text-zinc-50'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                {/* Subject Segmented Control */}
                <div className="flex items-center gap-1 rounded-lg bg-zinc-950 p-1 border border-zinc-800">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSelectedSubject(s);
                        setTargetConceptId(null);
                      }}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        selectedSubject === s
                          ? 'bg-zinc-800 text-zinc-50'
                          : 'text-zinc-400 hover:text-zinc-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Goal Picker & Mastery Telemetry */}
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="whitespace-nowrap">Target Goal</span>
                  <select
                    aria-label="Select target concept for shortest path"
                    value={targetConceptId ?? ''}
                    onChange={(e) =>
                      setTargetConceptId(e.target.value || null)
                    }
                    className="max-w-[240px] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <option value="">Choose concept goal...</option>
                    {courseConcepts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.chapter}: {c.title}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
                  <div className="text-right">
                    <div className="text-[11px] text-zinc-400">
                      Course Mastery
                    </div>
                    <div className="font-mono text-xs font-semibold tabular-nums text-zinc-100">
                      {masteryStats.masteredCount}/{masteryStats.totalCount} (
                      {masteryStats.percentage}%)
                    </div>
                  </div>
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
                      style={{ width: `${masteryStats.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Course Context Heading */}
            {activeCourse && (
              <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
                <div>
                  <h1 className="font-display text-xl font-bold text-zinc-50 sm:text-2xl">
                    {activeCourse.title}
                  </h1>
                  <p className="mt-0.5 text-xs text-zinc-400 sm:text-sm">
                    {activeCourse.description}
                  </p>
                </div>
                <div className="text-xs text-zinc-400 font-mono tabular-nums">
                  {courseConcepts.length} Concepts ·{' '}
                  {masteryStats.readyIds.length} Ready Now
                </div>
              </div>
            )}

            {/* Two-Zone Workspace Stage (65% Map / 35% Concept & Quiz Deck) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-8">
                <KnowledgeGraph
                  concepts={courseConcepts}
                  masteredIds={masteredSet}
                  selectedConceptId={selectedConceptId}
                  targetConceptId={targetConceptId}
                  shortestPathIds={shortestPath.orderedConceptIds}
                  shortestPathEdgeKeys={shortestPath.edgeKeys}
                  onSelectConcept={(id) => setSelectedConceptId(id)}
                />
              </div>

              <div className="lg:col-span-4">
                <ConceptDeck
                  course={activeCourse}
                  allCourseConcepts={courseConcepts}
                  selectedConcept={selectedConcept}
                  statusMap={statusMap}
                  masteredIds={masteredSet}
                  targetConceptId={targetConceptId}
                  shortestPathIds={shortestPath.orderedConceptIds}
                  shortestPathMinutes={shortestPath.totalMinutes}
                  studyHistory={studyHistory}
                  onSelectConcept={(id) => setSelectedConceptId(id)}
                  onSetTargetConcept={(id) => setTargetConceptId(id)}
                  onToggleMastery={handleToggleMastery}
                  onSubmitQuiz={handleSubmitQuiz}
                  onAskAiStudy={handleAskAiStudy}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {profileModalOpen && (
        <ProfileModal
          users={users}
          activeUser={activeUser}
          onSelectUser={handleSelectUser}
          onCreateUser={handleCreateUser}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
}

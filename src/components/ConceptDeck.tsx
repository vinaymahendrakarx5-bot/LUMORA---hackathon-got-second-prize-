import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Lock,
  MessageSquare,
  RotateCcw,
  Send,
  Target,
} from 'lucide-react';
import type { Concept, ConceptStatus, Course, StudyMessage } from '../lib/types';

interface QuizResultItem {
  questionId: string;
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

interface ConceptDeckProps {
  course: Course | undefined;
  allCourseConcepts: Concept[];
  selectedConcept: Concept | null;
  statusMap: Map<string, ConceptStatus>;
  masteredIds: Set<string>;
  targetConceptId: string | null;
  shortestPathIds: string[];
  shortestPathMinutes: number;
  studyHistory: StudyMessage[];
  onSelectConcept: (id: string) => void;
  onSetTargetConcept: (id: string | null) => void;
  onToggleMastery: (conceptId: string, mastered: boolean) => Promise<void>;
  onSubmitQuiz: (
    conceptId: string,
    answers: number[],
  ) => Promise<{
    attempt: { score: number; total: number; passed: boolean };
    results: QuizResultItem[];
  }>;
  onAskAiStudy: (conceptId: string, prompt: string) => Promise<void>;
}

export function ConceptDeck({
  course,
  allCourseConcepts,
  selectedConcept,
  statusMap,
  masteredIds,
  targetConceptId,
  shortestPathIds,
  shortestPathMinutes,
  studyHistory,
  onSelectConcept,
  onSetTargetConcept,
  onToggleMastery,
  onSubmitQuiz,
  onAskAiStudy,
}: ConceptDeckProps) {
  const [deckMode, setDeckMode] = useState<'overview' | 'quiz' | 'study'>('overview');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [studyPrompt, setStudyPrompt] = useState('');
  const [studyBusy, setStudyBusy] = useState(false);
  const [quizOutcome, setQuizOutcome] = useState<{
    score: number;
    total: number;
    passed: boolean;
    results: QuizResultItem[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset quiz UI whenever user selects a different concept
  useEffect(() => {
    setDeckMode('overview');
    setAnswers({});
    setQuizOutcome(null);
    setErrorMsg(null);
  }, [selectedConcept?.id]);

  const byId = new Map(allCourseConcepts.map((c) => [c.id, c]));
  const targetConcept = targetConceptId ? byId.get(targetConceptId) : null;

  const unlockedDependents = selectedConcept
    ? allCourseConcepts.filter((c) =>
        c.prerequisites.includes(selectedConcept.id),
      )
    : [];

  const handleQuizSubmit = async () => {
    if (!selectedConcept) return;
    const total = selectedConcept.quiz.length;
    const orderedAnswers = selectedConcept.quiz.map((_, idx) =>
      answers[idx] !== undefined ? answers[idx] : -1,
    );
    if (orderedAnswers.some((a) => a === -1)) {
      setErrorMsg(`Please answer all ${total} questions before submitting.`);
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      const outcome = await onSubmitQuiz(selectedConcept.id, orderedAnswers);
      setQuizOutcome({
        score: outcome.attempt.score,
        total: outcome.attempt.total,
        passed: outcome.attempt.passed,
        results: outcome.results,
      });
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (mastered: boolean) => {
    if (!selectedConcept) return;
    setToggling(true);
    setErrorMsg(null);
    try {
      await onToggleMastery(selectedConcept.id, mastered);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setToggling(false);
    }
  };

  return (
    <aside className="flex flex-col gap-4">
      {/* Shortest-Path Route Summary */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <h2 className="font-display text-sm font-semibold text-zinc-100">
              Shortest-Path Route
            </h2>
          </div>
          {targetConcept && (
            <button
              type="button"
              onClick={() => onSetTargetConcept(null)}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1.5 py-0.5"
            >
              Clear Goal
            </button>
          )}
        </div>

        {!targetConcept ? (
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            Pick a target goal concept from the toolbar or click{' '}
            <span className="text-zinc-200 font-medium">Set as Target Goal</span>{' '}
            on any node to compute the minimal unmastered prerequisite sequence.
          </p>
        ) : shortestPathIds.length === 0 ? (
          <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/25 p-3 text-xs text-emerald-200">
            Goal <span className="font-semibold">{targetConcept.title}</span> is
            already mastered. Select a higher concept to chart your next route.
          </div>
        ) : (
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>
                Target:{' '}
                <strong className="text-amber-300 font-medium">
                  {targetConcept.title}
                </strong>
              </span>
              <span className="font-mono tabular-nums text-zinc-300">
                {shortestPathIds.length} steps · {shortestPathMinutes} min
              </span>
            </div>

            <ol className="space-y-1.5">
              {shortestPathIds.map((id, idx) => {
                const c = byId.get(id);
                if (!c) return null;
                const st = statusMap.get(id) ?? 'locked';
                const isSelected = selectedConcept?.id === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => onSelectConcept(id)}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/15 text-amber-100'
                          : 'border-zinc-800 bg-zinc-950/70 text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="font-mono tabular-nums text-amber-400 shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="truncate font-medium">{c.title}</span>
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-zinc-400">
                        {st === 'ready' ? 'Next' : 'Queued'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </section>

      {/* Selected Concept Detail & Quiz */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
        {!selectedConcept ? (
          <div className="py-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-zinc-600" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-zinc-300">
              Select a concept node on the map
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Inspect prerequisites, formulas, and take a mastery check quiz.
            </p>
          </div>
        ) : (
          <div>
            {/* Clean Unboxed Metadata Line */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
              <span>
                {course?.board} Class {course?.grade} · {selectedConcept.chapter} ·{' '}
                <span className="font-mono tabular-nums">
                  {selectedConcept.estimatedMinutes} min
                </span>
              </span>

              {(() => {
                const st = statusMap.get(selectedConcept.id) ?? 'locked';
                if (st === 'mastered') {
                  return (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Mastered
                    </span>
                  );
                }
                if (st === 'ready') {
                  return (
                    <span className="inline-flex items-center gap-1 font-medium text-sky-300">
                      <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                      Ready to Learn
                    </span>
                  );
                }
                return (
                  <span className="inline-flex items-center gap-1 font-medium text-zinc-400">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    Prerequisites Pending
                  </span>
                );
              })()}
            </div>

            <h2 className="mt-2 font-display text-xl font-bold leading-snug text-zinc-50">
              {selectedConcept.title}
            </h2>

            <p className="mt-2.5 text-sm leading-relaxed text-zinc-300">
              {selectedConcept.summary}
            </p>

            {selectedConcept.formula && (
              <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5">
                <div className="text-[11px] font-medium text-zinc-400">
                  Key Formula / Principle
                </div>
                <div className="mt-1 font-mono text-sm text-amber-300">
                  {selectedConcept.formula}
                </div>
              </div>
            )}

            {/* Prerequisites & Dependents */}
            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-zinc-800 pt-4 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-medium text-zinc-400">
                  Prerequisites ({selectedConcept.prerequisites.length})
                </h3>
                {selectedConcept.prerequisites.length === 0 ? (
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Foundational entry node
                  </p>
                ) : (
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    {selectedConcept.prerequisites.map((pid) => {
                      const p = byId.get(pid);
                      if (!p) return null;
                      const done = masteredIds.has(pid);
                      return (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => onSelectConcept(pid)}
                          className="flex items-center justify-between gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-left text-xs text-zinc-200 hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        >
                          <span className="truncate">{p.title}</span>
                          <span
                            className={`shrink-0 text-[11px] ${
                              done ? 'text-emerald-400' : 'text-amber-300'
                            }`}
                          >
                            {done ? 'Done' : 'Needed'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-medium text-zinc-400">
                  Unlocks Next ({unlockedDependents.length})
                </h3>
                {unlockedDependents.length === 0 ? (
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Capstone concept in unit
                  </p>
                ) : (
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    {unlockedDependents.map((dep) => (
                      <button
                        key={dep.id}
                        type="button"
                        onClick={() => onSelectConcept(dep.id)}
                        className="flex items-center justify-between gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-left text-xs text-zinc-200 hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        <span className="truncate">{dep.title}</span>
                        <ArrowRight className="h-3 w-3 shrink-0 text-zinc-500" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-200"
              >
                {errorMsg}
              </div>
            )}

            {/* Action Buttons & Mode Switcher */}
            {deckMode === 'overview' ? (
              <div className="mt-5 space-y-2 border-t border-zinc-800 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  {selectedConcept.quiz.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeckMode('quiz');
                        setQuizOutcome(null);
                        setAnswers({});
                        setErrorMsg(null);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 whitespace-nowrap"
                    >
                      <span>Mastery Quiz</span>
                      <span className="font-mono tabular-nums">
                        ({selectedConcept.quiz.length})
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDeckMode('study');
                      setErrorMsg(null);
                    }}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2.5 text-xs font-semibold text-amber-200 transition-colors hover:border-orange-400 hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap ${
                      selectedConcept.quiz.length === 0 ? 'col-span-2' : ''
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                    <span>AI Study Tools</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={toggling}
                    onClick={() =>
                      handleToggle(!masteredIds.has(selectedConcept.id))
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap"
                  >
                    {masteredIds.has(selectedConcept.id) ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Reset Mastery</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                        <span>Mark Mastered</span>
                      </>
                    )}
                  </button>

                  {targetConceptId !== selectedConcept.id ? (
                    <button
                      type="button"
                      onClick={() => onSetTargetConcept(selectedConcept.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-amber-300 transition-colors hover:border-amber-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap"
                    >
                      <Target className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Set Target Goal</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSetTargetConcept(null)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 transition-colors hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap"
                    >
                      <Target className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Clear Goal</span>
                    </button>
                  )}
                </div>
              </div>
            ) : deckMode === 'study' ? (
              /* AI Study Tools Panel */
              <div className="mt-5 space-y-3 border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-zinc-100">
                    AI Study Tools
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDeckMode('overview')}
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Back to Summary
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Explain this simply with an analogy',
                    'Give a worked board-exam example',
                    'List common mistakes to avoid',
                  ].map((quickPrompt) => (
                    <button
                      key={quickPrompt}
                      type="button"
                      disabled={studyBusy}
                      onClick={async () => {
                        setStudyBusy(true);
                        setErrorMsg(null);
                        try {
                          await onAskAiStudy(selectedConcept.id, quickPrompt);
                        } catch (err) {
                          setErrorMsg((err as Error).message);
                        } finally {
                          setStudyBusy(false);
                        }
                      }}
                      className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-amber-500/50 hover:text-amber-200 disabled:opacity-50"
                    >
                      {quickPrompt}
                    </button>
                  ))}
                </div>

                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {studyHistory
                    .filter((m) => m.conceptId === selectedConcept.id)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-lg border p-3 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'border-zinc-800 bg-zinc-950 text-zinc-300'
                            : 'border-amber-500/30 bg-amber-950/20 text-zinc-100 whitespace-pre-wrap'
                        }`}
                      >
                        <div className="mb-1 font-mono text-[10px] text-zinc-400">
                          {msg.role === 'user' ? 'You' : 'LUMORA Study Tutor'}
                        </div>
                        {msg.content}
                      </div>
                    ))}
                  {studyHistory.filter((m) => m.conceptId === selectedConcept.id)
                    .length === 0 && (
                    <p className="py-3 text-xs text-zinc-500">
                      Ask a question or pick a quick study prompt above for guided{' '}
                      {course?.board} Class {course?.grade} explanations.
                    </p>
                  )}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!studyPrompt.trim()) return;
                    setStudyBusy(true);
                    setErrorMsg(null);
                    try {
                      await onAskAiStudy(selectedConcept.id, studyPrompt.trim());
                      setStudyPrompt('');
                    } catch (err) {
                      setErrorMsg((err as Error).message);
                    } finally {
                      setStudyBusy(false);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={studyPrompt}
                    onChange={(e) => setStudyPrompt(e.target.value)}
                    placeholder={`Ask about ${selectedConcept.title}...`}
                    aria-label="Ask AI Study Tools"
                    className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={studyBusy || !studyPrompt.trim()}
                    aria-label="Send study question"
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{studyBusy ? '...' : 'Ask'}</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Interactive Practice Quiz Panel */
              <div className="mt-5 space-y-4 border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-zinc-100">
                    Concept Mastery Check
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDeckMode('overview')}
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Back to Summary
                  </button>
                </div>

                {selectedConcept.quiz.map((q, qIdx) => {
                  const graded = quizOutcome?.results[qIdx];
                  return (
                    <fieldset
                      key={q.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3.5"
                    >
                      <legend className="px-1 text-xs font-medium text-zinc-200">
                        {qIdx + 1}. {q.prompt}
                      </legend>
                      <div className="mt-2.5 space-y-1.5">
                        {q.options.map((opt, oIdx) => {
                          const selected = answers[qIdx] === oIdx;
                          let optStyle =
                            'border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-zinc-600';
                          if (graded) {
                            if (oIdx === graded.correctIndex) {
                              optStyle =
                                'border-emerald-500/60 bg-emerald-950/40 text-emerald-200';
                            } else if (selected && !graded.correct) {
                              optStyle =
                                'border-rose-500/60 bg-rose-950/40 text-rose-200';
                            }
                          } else if (selected) {
                            optStyle =
                              'border-amber-400 bg-amber-500/15 text-amber-100';
                          }

                          return (
                            <label
                              key={oIdx}
                              className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-xs transition-colors ${optStyle}`}
                            >
                              <input
                                type="radio"
                                name={`quiz-${q.id}`}
                                checked={selected}
                                disabled={Boolean(quizOutcome)}
                                onChange={() =>
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [qIdx]: oIdx,
                                  }))
                                }
                                className="accent-amber-400"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {graded && (
                        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                          <strong
                            className={
                              graded.correct ? 'text-emerald-300' : 'text-amber-300'
                            }
                          >
                            {graded.correct ? 'Correct:' : 'Review:'}
                          </strong>{' '}
                          {graded.explanation}
                        </p>
                      )}
                    </fieldset>
                  );
                })}

                {quizOutcome ? (
                  <div
                    className={`rounded-lg border p-3.5 text-xs ${
                      quizOutcome.passed
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                        : 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>
                        {quizOutcome.passed
                          ? 'Concept Mastered!'
                          : 'Needs Review — Try Again'}
                      </span>
                      <span className="font-mono tabular-nums">
                        Score: {quizOutcome.score} / {quizOutcome.total}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setQuizOutcome(null);
                          setAnswers({});
                        }}
                        className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800"
                      >
                        Retake Quiz
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeckMode('overview')}
                        className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleQuizSubmit}
                      className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                    >
                      {submitting ? 'Grading...' : 'Submit Quiz'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeckMode('overview')}
                      className="rounded-lg border border-zinc-700 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </aside>
  );
}

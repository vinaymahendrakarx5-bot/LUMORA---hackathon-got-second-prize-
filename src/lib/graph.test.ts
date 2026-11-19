import test from 'node:test';
import assert from 'node:assert/strict';
import type { Concept } from './types';
import {
  calculateMasteryStats,
  computeConceptStatuses,
  computeShortestPath,
  layoutKnowledgeGraph,
  wouldCreateCycle,
} from './graph';

const sampleConcepts: Concept[] = [
  {
    id: 'c1',
    courseId: 'course-1',
    title: 'Integers & Number Line',
    chapter: 'Ch 1',
    summary: 'Foundations of positive and negative integers.',
    estimatedMinutes: 15,
    prerequisites: [],
    quiz: [],
  },
  {
    id: 'c2',
    courseId: 'course-1',
    title: 'Algebraic Expressions',
    chapter: 'Ch 2',
    summary: 'Variables, constants, and coefficients.',
    estimatedMinutes: 20,
    prerequisites: ['c1'],
    quiz: [],
  },
  {
    id: 'c3',
    courseId: 'course-1',
    title: 'Linear Equations',
    chapter: 'Ch 3',
    summary: 'Solving one-variable linear equations.',
    estimatedMinutes: 25,
    prerequisites: ['c2'],
    quiz: [],
  },
  {
    id: 'c4',
    courseId: 'course-1',
    title: 'Coordinate Geometry',
    chapter: 'Ch 4',
    summary: 'Plotting linear graphs on the Cartesian plane.',
    estimatedMinutes: 30,
    prerequisites: ['c1', 'c3'],
    quiz: [],
  },
];

test('computeConceptStatuses marks roots ready and dependents locked until mastered', () => {
  const s0 = computeConceptStatuses(sampleConcepts, []);
  assert.equal(s0.get('c1'), 'ready');
  assert.equal(s0.get('c2'), 'locked');
  assert.equal(s0.get('c3'), 'locked');
  assert.equal(s0.get('c4'), 'locked');

  const s1 = computeConceptStatuses(sampleConcepts, ['c1']);
  assert.equal(s1.get('c1'), 'mastered');
  assert.equal(s1.get('c2'), 'ready');
  assert.equal(s1.get('c3'), 'locked');
});

test('computeShortestPath skips already-mastered prerequisites and returns topological order', () => {
  const p0 = computeShortestPath(sampleConcepts, 'c4', []);
  assert.deepEqual(p0.orderedConceptIds, ['c1', 'c2', 'c3', 'c4']);
  assert.equal(p0.totalMinutes, 90);
  assert.equal(p0.edgeKeys.has('c1->c2'), true);
  assert.equal(p0.edgeKeys.has('c3->c4'), true);

  const p1 = computeShortestPath(sampleConcepts, 'c4', ['c1', 'c2']);
  assert.deepEqual(p1.orderedConceptIds, ['c3', 'c4']);
  assert.equal(p1.totalMinutes, 55);
  assert.equal(p1.edgeKeys.has('c1->c2'), false);
  assert.equal(p1.edgeKeys.has('c3->c4'), true);

  const pDone = computeShortestPath(sampleConcepts, 'c4', ['c1', 'c2', 'c3', 'c4']);
  assert.deepEqual(pDone.orderedConceptIds, []);
});

test('wouldCreateCycle detects self-loops and transitive cycles', () => {
  assert.equal(wouldCreateCycle(sampleConcepts, 'c1', 'c1'), true);
  assert.equal(wouldCreateCycle(sampleConcepts, 'c4', 'c1'), true);
  assert.equal(wouldCreateCycle(sampleConcepts, 'c3', 'c2'), true);
  assert.equal(wouldCreateCycle(sampleConcepts, 'c2', 'c4'), false);
});

test('layoutKnowledgeGraph assigns strictly increasing X layers along prerequisites', () => {
  const { nodes } = layoutKnowledgeGraph(sampleConcepts, ['c1'], ['c2', 'c3', 'c4']);
  const byId = new Map(nodes.map((n) => [n.concept.id, n]));
  assert.equal(byId.get('c1')!.layer, 0);
  assert.equal(byId.get('c2')!.layer, 1);
  assert.equal(byId.get('c3')!.layer, 2);
  assert.equal(byId.get('c4')!.layer, 3);
  assert.ok(byId.get('c4')!.x > byId.get('c3')!.x);
  assert.equal(byId.get('c2')!.pathStepIndex, 1);
  assert.equal(byId.get('c4')!.pathStepIndex, 3);
});

test('calculateMasteryStats returns accurate percentage and ready nodes', () => {
  const stats = calculateMasteryStats(sampleConcepts, ['c1', 'c2']);
  assert.equal(stats.masteredCount, 2);
  assert.equal(stats.totalCount, 4);
  assert.equal(stats.percentage, 50);
  assert.deepEqual(stats.readyIds, ['c3']);
});

import type { Concept, ConceptStatus, PositionedConceptNode } from './types';

/**
 * Computes mastery status for every concept in the provided list.
 * A concept is 'ready' when it is not yet mastered and all of its
 * prerequisites (within the curriculum) are already mastered.
 */
export function computeConceptStatuses(
  concepts: Concept[],
  masteredIds: ReadonlySet<string> | string[],
): Map<string, ConceptStatus> {
  const mastered = masteredIds instanceof Set ? masteredIds : new Set(masteredIds);
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const statuses = new Map<string, ConceptStatus>();

  for (const concept of concepts) {
    if (mastered.has(concept.id)) {
      statuses.set(concept.id, 'mastered');
      continue;
    }
    const prereqsMet = concept.prerequisites.every((pid) => {
      if (!byId.has(pid)) return true;
      return mastered.has(pid);
    });
    statuses.set(concept.id, prereqsMet ? 'ready' : 'locked');
  }

  return statuses;
}

/**
 * Computes the minimal prerequisite-ordered learning path to reach `targetId`
 * given the learner's currently mastered concepts.
 *
 * Returns an ordered array of concept IDs ending with `targetId` (or empty if
 * `targetId` is already mastered or does not exist), plus the set of directed
 * edge keys `"fromId->toId"` along the path.
 */
export function computeShortestPath(
  concepts: Concept[],
  targetId: string,
  masteredIds: ReadonlySet<string> | string[],
): {
  orderedConceptIds: string[];
  edgeKeys: Set<string>;
  totalMinutes: number;
} {
  const mastered = masteredIds instanceof Set ? masteredIds : new Set(masteredIds);
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const target = byId.get(targetId);

  if (!target || mastered.has(targetId)) {
    return { orderedConceptIds: [], edgeKeys: new Set(), totalMinutes: 0 };
  }

  // Collect all unmastered ancestor prerequisites reachable from targetId
  const needed = new Set<string>();
  const stack = [targetId];
  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (needed.has(currentId) || mastered.has(currentId)) continue;
    const node = byId.get(currentId);
    if (!node) continue;
    needed.add(currentId);
    for (const prereqId of node.prerequisites) {
      if (byId.has(prereqId) && !mastered.has(prereqId) && !needed.has(prereqId)) {
        stack.push(prereqId);
      }
    }
  }

  // Compute topological depth for deterministic shortest-path ordering
  const depthMemo = new Map<string, number>();
  const visiting = new Set<string>();

  function getDepth(id: string): number {
    if (depthMemo.has(id)) return depthMemo.get(id)!;
    if (visiting.has(id)) return 0; // Guard against malformed cycles
    visiting.add(id);
    const node = byId.get(id);
    let maxPrereqDepth = -1;
    if (node) {
      for (const pid of node.prerequisites) {
        if (needed.has(pid)) {
          maxPrereqDepth = Math.max(maxPrereqDepth, getDepth(pid));
        }
      }
    }
    visiting.delete(id);
    const depth = maxPrereqDepth + 1;
    depthMemo.set(id, depth);
    return depth;
  }

  for (const id of needed) {
    getDepth(id);
  }

  // Kahn's algorithm with priority by topological depth and estimated minutes
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const id of needed) {
    inDegree.set(id, 0);
    dependents.set(id, []);
  }

  const edgeKeys = new Set<string>();
  for (const id of needed) {
    const node = byId.get(id)!;
    for (const pid of node.prerequisites) {
      if (needed.has(pid)) {
        inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
        dependents.get(pid)!.push(id);
        edgeKeys.add(`${pid}->${id}`);
      }
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  const orderedConceptIds: string[] = [];
  while (queue.length > 0) {
    queue.sort((a, b) => {
      const da = depthMemo.get(a) ?? 0;
      const db = depthMemo.get(b) ?? 0;
      if (da !== db) return da - db;
      return (byId.get(a)?.title ?? '').localeCompare(byId.get(b)?.title ?? '');
    });
    const current = queue.shift()!;
    orderedConceptIds.push(current);
    for (const dep of dependents.get(current) ?? []) {
      const nextDeg = (inDegree.get(dep) ?? 1) - 1;
      inDegree.set(dep, nextDeg);
      if (nextDeg === 0) {
        queue.push(dep);
      }
    }
  }

  const totalMinutes = orderedConceptIds.reduce(
    (sum, id) => sum + (byId.get(id)?.estimatedMinutes ?? 0),
    0,
  );

  return { orderedConceptIds, edgeKeys, totalMinutes };
}

/**
 * Checks whether adding a prerequisite edge `prereqId -> conceptId`
 * would introduce a cycle into the concept DAG.
 */
export function wouldCreateCycle(
  concepts: Concept[],
  prereqId: string,
  conceptId: string,
): boolean {
  if (prereqId === conceptId) return true;
  const byId = new Map(concepts.map((c) => [c.id, c]));
  // Cycle occurs if conceptId is already an ancestor of prereqId
  const visited = new Set<string>();
  const stack = [prereqId];

  while (stack.length > 0) {
    const curr = stack.pop()!;
    if (curr === conceptId) return true;
    if (visited.has(curr)) continue;
    visited.add(curr);
    const node = byId.get(curr);
    if (!node) continue;
    for (const p of node.prerequisites) {
      if (!visited.has(p)) stack.push(p);
    }
  }

  return false;
}

/**
 * Computes layered DAG layout coordinates for rendering the interactive
 * knowledge graph without overlapping nodes.
 */
export function layoutKnowledgeGraph(
  concepts: Concept[],
  masteredIds: ReadonlySet<string> | string[],
  shortestPathIds: string[],
): {
  nodes: PositionedConceptNode[];
  width: number;
  height: number;
} {
  if (concepts.length === 0) {
    return { nodes: [], width: 900, height: 420 };
  }

  const byId = new Map(concepts.map((c) => [c.id, c]));
  const statuses = computeConceptStatuses(concepts, masteredIds);
  const pathIndexMap = new Map<string, number>();
  shortestPathIds.forEach((id, idx) => pathIndexMap.set(id, idx + 1));

  // Topological layer assignment (longest path from root)
  const layerMemo = new Map<string, number>();
  const visiting = new Set<string>();

  function getLayer(id: string): number {
    if (layerMemo.has(id)) return layerMemo.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const node = byId.get(id);
    let maxParent = -1;
    if (node) {
      for (const pid of node.prerequisites) {
        if (byId.has(pid)) {
          maxParent = Math.max(maxParent, getLayer(pid));
        }
      }
    }
    visiting.delete(id);
    const layer = maxParent + 1;
    layerMemo.set(id, layer);
    return layer;
  }

  const layers = new Map<number, Concept[]>();
  let maxLayer = 0;
  for (const c of concepts) {
    const layer = getLayer(c.id);
    maxLayer = Math.max(maxLayer, layer);
    const bucket = layers.get(layer) ?? [];
    bucket.push(c);
    layers.set(layer, bucket);
  }

  // Order rows inside each layer using barycenter heuristic of parent rows
  const rowMap = new Map<string, number>();
  for (let l = 0; l <= maxLayer; l++) {
    const group = layers.get(l) ?? [];
    group.sort((a, b) => {
      const avgParentRow = (c: Concept) => {
        const parents = c.prerequisites.filter((pid) => rowMap.has(pid));
        if (parents.length === 0) return 0;
        return (
          parents.reduce((sum, pid) => sum + (rowMap.get(pid) ?? 0), 0) /
          parents.length
        );
      };
      const diff = avgParentRow(a) - avgParentRow(b);
      if (Math.abs(diff) > 0.01) return diff;
      return a.title.localeCompare(b.title);
    });
    group.forEach((c, idx) => rowMap.set(c.id, idx));
  }

  const maxRows = Math.max(
    1,
    ...Array.from(layers.values()).map((g) => g.length),
  );

  const colSpacing = 216;
  const rowSpacing = 118;
  const padX = 28;
  const padY = 44;
  const nodeWidth = 182;
  const nodeHeight = 84;

  const totalHeight = Math.max(440, padY * 2 + (maxRows - 1) * rowSpacing + nodeHeight);
  const totalWidth = Math.max(820, padX * 2 + maxLayer * colSpacing + nodeWidth);

  const nodes: PositionedConceptNode[] = [];
  for (let l = 0; l <= maxLayer; l++) {
    const group = layers.get(l) ?? [];
    const layerHeight = (group.length - 1) * rowSpacing + nodeHeight;
    const startY = (totalHeight - layerHeight) / 2;

    group.forEach((concept, rowIdx) => {
      const x = padX + l * colSpacing;
      const y = startY + rowIdx * rowSpacing;
      nodes.push({
        concept,
        layer: l,
        row: rowIdx,
        x,
        y,
        status: statuses.get(concept.id) ?? 'locked',
        onShortestPath: pathIndexMap.has(concept.id),
        pathStepIndex: pathIndexMap.get(concept.id) ?? null,
      });
    });
  }

  return { nodes, width: totalWidth, height: totalHeight };
}

export function calculateMasteryStats(
  concepts: Concept[],
  masteredIds: ReadonlySet<string> | string[],
): {
  masteredCount: number;
  totalCount: number;
  percentage: number;
  readyIds: string[];
} {
  const mastered = masteredIds instanceof Set ? masteredIds : new Set(masteredIds);
  const statuses = computeConceptStatuses(concepts, mastered);
  let masteredCount = 0;
  const readyIds: string[] = [];

  for (const c of concepts) {
    const st = statuses.get(c.id);
    if (st === 'mastered') masteredCount++;
    else if (st === 'ready') readyIds.push(c.id);
  }

  const totalCount = concepts.length;
  const percentage =
    totalCount === 0 ? 0 : Math.round((masteredCount / totalCount) * 100);

  return { masteredCount, totalCount, percentage, readyIds };
}

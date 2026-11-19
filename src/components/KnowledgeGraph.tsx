import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  Lock,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { Concept } from '../lib/types';
import { layoutKnowledgeGraph } from '../lib/graph';

interface KnowledgeGraphProps {
  concepts: Concept[];
  masteredIds: Set<string>;
  selectedConceptId: string | null;
  targetConceptId: string | null;
  shortestPathIds: string[];
  shortestPathEdgeKeys: Set<string>;
  onSelectConcept: (conceptId: string) => void;
}

const NODE_W = 182;
const NODE_H = 84;

export function KnowledgeGraph({
  concepts,
  masteredIds,
  selectedConceptId,
  targetConceptId,
  shortestPathIds,
  shortestPathEdgeKeys,
  onSelectConcept,
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(900);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    setContainerWidth(el.clientWidth || 900);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w && w > 0) setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [concepts.length]);

  const { nodes, width, height } = useMemo(
    () => layoutKnowledgeGraph(concepts, masteredIds, shortestPathIds),
    [concepts, masteredIds, shortestPathIds],
  );

  const fitZoom = useMemo(() => {
    if (width <= containerWidth) return 1;
    return Math.max(0.62, Number(((containerWidth - 16) / width).toFixed(2)));
  }, [width, containerWidth]);

  const zoom = manualZoom ?? fitZoom;
  const setZoom = (updater: (prev: number) => number) => {
    setManualZoom((prev) => updater(prev ?? fitZoom));
  };

  const nodeMap = useMemo(
    () => new Map(nodes.map((n) => [n.concept.id, n])),
    [nodes],
  );

  const edges = useMemo(() => {
    const list: {
      key: string;
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      onPath: boolean;
      masteredEdge: boolean;
    }[] = [];

    for (const node of nodes) {
      for (const pid of node.concept.prerequisites) {
        const parent = nodeMap.get(pid);
        if (!parent) continue;
        const key = `${pid}->${node.concept.id}`;
        list.push({
          key,
          fromX: parent.x + NODE_W,
          fromY: parent.y + NODE_H / 2,
          toX: node.x,
          toY: node.y + NODE_H / 2,
          onPath: shortestPathEdgeKeys.has(key),
          masteredEdge:
            masteredIds.has(pid) && masteredIds.has(node.concept.id),
        });
      }
    }
    return list;
  }, [nodes, nodeMap, shortestPathEdgeKeys, masteredIds]);

  if (concepts.length === 0) {
    return (
      <div className="flex h-[460px] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <p className="text-base font-medium text-zinc-200">
          No concepts match the active filter.
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Select another Class, Board, or Subject above, or add concepts in Teacher Studio.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      {/* Graph Toolbar & Dual-Coded Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span>Mastered</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
            <span>Ready to Learn</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <span>Locked</span>
          </span>
          {shortestPathIds.length > 0 && (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-300">
              <span className="h-2 w-4 rounded-sm bg-amber-400" aria-hidden="true" />
              <span>Shortest Path ({shortestPathIds.length} steps)</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.65, Number((z - 0.1).toFixed(2))))}
            aria-label="Zoom out knowledge graph"
            className="rounded-md border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span className="min-w-[44px] text-center font-mono text-xs tabular-nums text-zinc-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.3, Number((z + 0.1).toFixed(2))))}
            aria-label="Zoom in knowledge graph"
            className="rounded-md border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setManualZoom(null)}
            aria-label="Reset graph zoom"
            className="ml-1 inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap"
          >
            <Maximize2 className="h-3 w-3" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Scrollable DAG Canvas */}
      <div
        ref={containerRef}
        data-testid="knowledge-graph-canvas"
        className="bg-atlas-grid relative h-[520px] w-full overflow-auto"
      >
        <div
          className="relative origin-top-left transition-transform duration-150"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${zoom})`,
          }}
        >
          {/* SVG Dependency Edges */}
          <svg
            width={width}
            height={height}
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="arrow-default"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,1 L7,4 L0,7 Z" fill="#52525b" />
              </marker>
              <marker
                id="arrow-mastered"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,1 L7,4 L0,7 Z" fill="#10b981" />
              </marker>
              <marker
                id="arrow-path"
                markerWidth="9"
                markerHeight="9"
                refX="7.5"
                refY="4.5"
                orient="auto"
              >
                <path d="M0,1 L8,4.5 L0,8 Z" fill="#f59e0b" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const dx = Math.max(48, (edge.toX - edge.fromX) * 0.5);
              const d = `M ${edge.fromX} ${edge.fromY} C ${edge.fromX + dx} ${edge.fromY}, ${edge.toX - dx} ${edge.toY}, ${edge.toX - 3} ${edge.toY}`;
              const stroke = edge.onPath
                ? '#f59e0b'
                : edge.masteredEdge
                  ? '#10b981'
                  : '#3f3f46';
              const marker = edge.onPath
                ? 'url(#arrow-path)'
                : edge.masteredEdge
                  ? 'url(#arrow-mastered)'
                  : 'url(#arrow-default)';

              return (
                <path
                  key={edge.key}
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={edge.onPath ? 2.6 : 1.75}
                  strokeDasharray={edge.onPath ? '6 4' : undefined}
                  markerEnd={marker}
                  opacity={edge.onPath ? 1 : 0.78}
                />
              );
            })}
          </svg>

          {/* Accessible Semantic Concept Node Buttons */}
          {nodes.map((node) => {
            const { concept, status, onShortestPath, pathStepIndex, x, y } = node;
            const isSelected = selectedConceptId === concept.id;
            const isTarget = targetConceptId === concept.id;

            let cardClasses =
              'border-zinc-800 bg-zinc-900/95 text-zinc-200 hover:border-zinc-600';
            if (status === 'mastered') {
              cardClasses =
                'border-emerald-500/45 bg-emerald-950/30 text-zinc-100 hover:border-emerald-400';
            } else if (status === 'ready') {
              cardClasses =
                'border-sky-500/45 bg-zinc-900 text-zinc-100 hover:border-sky-400';
            }

            if (onShortestPath) {
              cardClasses =
                'border-amber-400 bg-amber-950/35 text-amber-50 shadow-[0_0_24px_rgba(245,158,11,0.18)]';
            }

            if (isSelected) {
              cardClasses += ' ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950';
            }

            return (
              <button
                key={concept.id}
                type="button"
                onClick={() => onSelectConcept(concept.id)}
                aria-label={`${concept.title}, ${status}${
                  pathStepIndex ? `, shortest path step ${pathStepIndex}` : ''
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${NODE_W}px`,
                  height: `${NODE_H}px`,
                }}
                className={`absolute flex flex-col justify-between rounded-xl border p-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${cardClasses}`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono text-zinc-400 truncate">
                    {concept.chapter}
                  </span>

                  <span className="inline-flex items-center gap-1 font-medium whitespace-nowrap shrink-0">
                    {pathStepIndex !== null ? (
                      <span className="font-mono text-amber-300">
                        {isTarget ? `Goal · Step ${pathStepIndex}` : `Step ${pathStepIndex}`}
                      </span>
                    ) : status === 'mastered' ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                        <span className="text-emerald-300">Mastered</span>
                      </>
                    ) : status === 'ready' ? (
                      <>
                        <Compass className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                        <span className="text-sky-300">Ready</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                        <span className="text-zinc-400">Locked</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="line-clamp-2 text-[13px] font-semibold leading-snug">
                  {concept.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

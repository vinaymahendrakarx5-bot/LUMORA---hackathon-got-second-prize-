import { Sparkles, User } from 'lucide-react';
import type { UserProfile } from '../lib/types';

export type ActiveTab = 'map' | 'catalog' | 'teacher';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onReplayIntro: () => void;
  activeUser: UserProfile;
  onOpenProfileModal: () => void;
}

export function TopBar({
  activeTab,
  onSelectTab,
  onReplayIntro,
  activeUser,
  onOpenProfileModal,
}: TopBarProps) {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'map', label: 'Knowledge Map' },
    { id: 'catalog', label: 'Curriculum' },
    { id: 'teacher', label: 'Teacher Studio' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/90 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 py-3 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('map')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md whitespace-nowrap shrink-0"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10">
            <svg viewBox="0 0 32 32" className="h-4.5 w-4.5" aria-hidden="true">
              <polygon
                points="16,3 27,12 22,28 10,28 5,12"
                fill="#f59e0b"
                fillOpacity="0.25"
                stroke="#fbbf24"
                strokeWidth="2"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-bold tracking-[0.14em] text-zinc-50 whitespace-nowrap shrink-0">
            LUMORA
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded ${
                  isActive
                    ? 'text-amber-300'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-amber-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Replay Intro & Active Profile Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onReplayIntro}
            aria-label="Replay 3-second intro animation"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-amber-500/50 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span>Intro</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfileModal}
            aria-label={`Switch profile: ${activeUser.name}`}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 whitespace-nowrap shrink-0"
          >
            <User className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span className="max-w-[120px] truncate">{activeUser.name}</span>
          </button>
        </div>
      </div>

      {/* Mobile Compact Nav */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center justify-around border-t border-zinc-800/80 px-2 py-1.5"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

'use client';

import { BarChart3, TrendingUp, Maximize2, Minimize2, Camera } from 'lucide-react';

interface ChartToolbarProps {
  showVolume: boolean;
  onToggleVolume: () => void;
  showSMA: boolean;
  onToggleSMA: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onScreenshot: () => void;
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors btn-press ${
        active
          ? 'bg-white/10 text-foreground'
          : 'text-muted hover:text-foreground hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

export function ChartToolbar({
  showVolume,
  onToggleVolume,
  showSMA,
  onToggleSMA,
  isFullscreen,
  onToggleFullscreen,
  onScreenshot,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton active={showVolume} onClick={onToggleVolume} title="Volume (V)">
        <BarChart3 size={13} />
      </ToolbarButton>
      <ToolbarButton active={showSMA} onClick={onToggleSMA} title="SMA 7/25 (S)">
        <TrendingUp size={13} />
      </ToolbarButton>
      <ToolbarButton onClick={onScreenshot} title="Screenshot">
        <Camera size={13} />
      </ToolbarButton>
      <ToolbarButton onClick={onToggleFullscreen} title="Fullscreen (F)">
        {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
      </ToolbarButton>
    </div>
  );
}

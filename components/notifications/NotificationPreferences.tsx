'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { NotificationPreferences as Prefs } from '@/lib/hooks/useNotifications';
import type { TokenSource, SafetyLevel } from '@/lib/types/token';
import { COLORS } from '@/lib/utils/constants';
import { Volume2, VolumeX, Bell, BellOff, X } from 'lucide-react';

interface NotificationPreferencesProps {
  preferences: Prefs;
  onUpdate: (updates: Partial<Prefs>) => void;
  onRequestBrowserPermission: () => void;
  onClose: () => void;
}

export function NotificationPreferences({
  preferences,
  onUpdate,
  onRequestBrowserPermission,
  onClose,
}: NotificationPreferencesProps) {
  const t = useTranslations('preferences');
  const toggleSource = (source: TokenSource) => {
    const sources = preferences.sources.includes(source)
      ? preferences.sources.filter((s) => s !== source)
      : [...preferences.sources, source];
    onUpdate({ sources });
  };

  const toggleSafetyLevel = (level: SafetyLevel) => {
    const levels = preferences.safetyLevels.includes(level)
      ? preferences.safetyLevels.filter((l) => l !== level)
      : [...preferences.safetyLevels, level];
    onUpdate({ safetyLevels: levels });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Sound toggle */}
          <ToggleRow
            icon={preferences.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            label={t('sound.label')}
            description={t('sound.description')}
            enabled={preferences.soundEnabled}
            onToggle={() => onUpdate({ soundEnabled: !preferences.soundEnabled })}
          />

          {/* Browser notifications */}
          <ToggleRow
            icon={preferences.browserNotificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            label={t('browser.label')}
            description={t('browser.description')}
            enabled={preferences.browserNotificationsEnabled}
            onToggle={() => {
              if (!preferences.browserNotificationsEnabled) {
                onRequestBrowserPermission();
              } else {
                onUpdate({ browserNotificationsEnabled: false });
              }
            }}
          />

          {/* Safety level filter */}
          <div>
            <label className="text-sm font-medium">{t('safetyLevel.label')}</label>
            <p className="text-xs text-muted mb-2">{t('safetyLevel.description')}</p>
            <div className="flex gap-2">
              {([
                { value: 'safe' as SafetyLevel, label: t('safetyLevel.safe'), color: COLORS.safe },
                { value: 'warning' as SafetyLevel, label: t('safetyLevel.warning'), color: COLORS.warning },
                { value: 'danger' as SafetyLevel, label: t('safetyLevel.danger'), color: COLORS.danger },
              ]).map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => toggleSafetyLevel(value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    preferences.safetyLevels.includes(value)
                      ? 'bg-white/10 text-foreground'
                      : 'text-muted bg-white/[0.02]'
                  }`}
                  style={
                    preferences.safetyLevels.includes(value)
                      ? { color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }
                      : undefined
                  }
                >
                  {preferences.safetyLevels.includes(value) && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Source filters */}
          <div>
            <label className="text-sm font-medium">{t('sources.label')}</label>
            <p className="text-xs text-muted mb-2">{t('sources.description')}</p>
            <div className="flex gap-2">
              {(['pumpfun', 'raydium', 'moonshot'] as TokenSource[]).map((source) => (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    preferences.sources.includes(source)
                      ? 'bg-white/10 text-foreground'
                      : 'text-muted bg-white/[0.02]'
                  }`}
                >
                  {source === 'pumpfun' ? 'Pump.fun' : source === 'raydium' ? 'Raydium' : 'Moonshot'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-muted">{icon}</span>
        <div>
          <span className="text-sm font-medium">{label}</span>
          <p className="text-xs text-muted">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-10 h-6 rounded-full transition-colors relative ${
          enabled ? 'bg-safe/30' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
            enabled ? 'left-5 bg-safe' : 'left-1 bg-muted'
          }`}
        />
      </button>
    </div>
  );
}

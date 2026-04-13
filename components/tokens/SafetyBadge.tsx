'use client';

import { motion } from 'framer-motion';
import type { SafetyLevel } from '@/lib/types/token';
import { getSafetyColor, getSafetyLabel } from '@/lib/utils/safety';
import { Shield, ShieldAlert, ShieldX, ShieldQuestion } from 'lucide-react';

const icons = {
  safe: Shield,
  warning: ShieldAlert,
  danger: ShieldX,
  unknown: ShieldQuestion,
};

export function SafetyBadge({ level, score }: { level: SafetyLevel; score?: number | null }) {
  const color = getSafetyColor(level);
  const label = getSafetyLabel(level);
  const Icon = icons[level];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
      style={{
        backgroundColor: `${color}15`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      <Icon size={12} />
      <span>{label}</span>
    </motion.div>
  );
}

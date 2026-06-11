import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card = ({ children, className = '', title, subtitle }: CardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card p-6 ${className}`}
  >
    {(title || subtitle) && (
      <div className="mb-4">
        {title && <h3 className="text-lg font-semibold font-display text-slate-800 dark:text-white">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
    )}
    {children}
  </motion.div>
);

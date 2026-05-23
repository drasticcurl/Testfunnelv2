'use client';

import { motion } from 'framer-motion';
import { Check } from '@phosphor-icons/react';

type ShoppingItemProps = {
  id: string;
  name: string;
  checked: boolean;
  onToggle: (id: string) => void;
};

export default function ShoppingItem({ id, name, checked, onToggle }: ShoppingItemProps) {
  return (
    <motion.button
      onClick={() => onToggle(id)}
      className="flex items-start gap-3 w-full text-left py-2.5 px-1 group"
      whileTap={{ scale: 0.98 }}
    >
      {/* Checkbox */}
      <div
        className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? 'bg-sage border-sage'
            : 'border-charcoal/20 group-hover:border-sage/50'
        }`}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Check size={12} weight="bold" className="text-white" />
          </motion.div>
        )}
      </div>

      {/* Item name */}
      <span
        className={`text-sm leading-snug transition-all duration-200 ${
          checked
            ? 'text-charcoal/40 line-through'
            : 'text-charcoal'
        }`}
      >
        {name}
      </span>
    </motion.button>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react';
import ShoppingItem from './ShoppingItem';
import type { ShoppingItem as ShoppingItemType } from '@/lib/pwa/shopping-data';

type CategoryAccordionProps = {
  emoji: string;
  label: string;
  items: ShoppingItemType[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  defaultOpen?: boolean;
};

export default function CategoryAccordion({
  emoji,
  label,
  items,
  checkedIds,
  onToggle,
  defaultOpen = true,
}: CategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const checkedCount = items.filter((item) => checkedIds.has(item.id)).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-warm rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] flex items-center justify-between px-4 py-3 hover:bg-warm-border/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="font-body font-medium text-charcoal text-sm">{label}</span>
          <span className="font-body text-xs text-charcoal/40 ml-1">
            {checkedCount}/{totalCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mini progress bar */}
          <div className="w-12 h-1.5 bg-warm-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-terracotta rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Caret */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <CaretDown size={16} className="text-charcoal/40" />
          </motion.div>
        </div>
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t border-warm-border/50">
              {items.map((item) => (
                <ShoppingItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  checked={checkedIds.has(item.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

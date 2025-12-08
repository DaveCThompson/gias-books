// packages/ui/src/components/Popover/Popover.tsx

import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@gia/utils';
import styles from './Popover.module.css';

// Animation config for popover entrance
const POPOVER_ANIMATION = {
    initial: { opacity: 0, scale: 0.95, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -4 },
    transition: {
        duration: 0.15,
        ease: [0.16, 1, 0.3, 1] as const, // --ease-out-expo
    },
};

export interface PopoverProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({ open, onOpenChange, children }) => {
    return (
        <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
            {children}
        </PopoverPrimitive.Root>
    );
};

export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export interface PopoverContentProps {
    children: React.ReactNode;
    className?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({
    children,
    className,
    side = 'bottom',
    align = 'center',
    sideOffset = 8,
}) => {
    return (
        <PopoverPrimitive.Portal>
            <AnimatePresence>
                <PopoverPrimitive.Content asChild side={side} align={align} sideOffset={sideOffset}>
                    <motion.div className={cn(styles.content, className)} {...POPOVER_ANIMATION}>
                        {children}
                    </motion.div>
                </PopoverPrimitive.Content>
            </AnimatePresence>
        </PopoverPrimitive.Portal>
    );
};

// Re-export primitive for advanced usage
export { PopoverPrimitive };

// packages/ui/src/components/Dialog/Dialog.tsx

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@gia/utils';
import styles from './Dialog.module.css';

// Animation config per design spec
const DIALOG_ANIMATION = {
    initial: { opacity: 0, scale: 0.95, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 8 },
    transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1] as const, // --ease-out-expo
    },
};

const OVERLAY_ANIMATION = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 } as const,
};

export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            {children}
        </DialogPrimitive.Root>
    );
};

export const DialogTrigger = DialogPrimitive.Trigger;

export interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
    return (
        <DialogPrimitive.Portal>
            <AnimatePresence>
                <DialogPrimitive.Overlay asChild>
                    <motion.div
                        className={styles.overlay}
                        {...OVERLAY_ANIMATION}
                    />
                </DialogPrimitive.Overlay>
                <DialogPrimitive.Content asChild>
                    <motion.div
                        className={cn(styles.content, className)}
                        {...DIALOG_ANIMATION}
                    >
                        {children}
                    </motion.div>
                </DialogPrimitive.Content>
            </AnimatePresence>
        </DialogPrimitive.Portal>
    );
};

export const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => {
    return <div className={cn(styles.header, className)}>{children}</div>;
};

export const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => {
    return <div className={cn(styles.footer, className)}>{children}</div>;
};

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

// Re-export primitive for advanced usage
export { DialogPrimitive };

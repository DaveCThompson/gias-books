// packages/ui/src/components/Tooltip/Tooltip.tsx

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@gia/utils';
import styles from './Tooltip.module.css';

export interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    sideOffset?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    side = 'top',
    align = 'center',
    delayDuration = 400,
    sideOffset = 4,
}) => {
    return (
        <TooltipPrimitive.Root delayDuration={delayDuration}>
            <TooltipPrimitive.Trigger asChild>
                {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    className={styles.content}
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                >
                    {content}
                    <TooltipPrimitive.Arrow className={styles.arrow} />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    );
};

// Provider component for global tooltip configuration
export type TooltipProviderProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>;

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children, ...props }) => {
    return <TooltipPrimitive.Provider {...props}>{children}</TooltipPrimitive.Provider>;
};

// Re-export for convenience
export { TooltipPrimitive };

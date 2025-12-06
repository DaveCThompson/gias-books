// src/features/BookReader/components/SettingsDialog.tsx

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { motion, AnimatePresence } from 'motion/react';
import { useSettingsStore, ThemePreference } from '@/data/settings.store';
import styles from './SettingsDialog.module.css';

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onOpenChange }) => {
  const { theme, setTheme } = useSettingsStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
          <Dialog.Portal forceMount>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dialog.Overlay className={styles.overlay} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            >
              <Dialog.Content className={styles.content}>
                <Dialog.Title className={styles.title}>Settings</Dialog.Title>
                <fieldset className={styles.fieldset}>
                  <label className={styles.label}>Appearance</label>
                  <RadioGroup.Root
                    className={styles.radioGroup}
                    value={theme}
                    onValueChange={(value: string) => setTheme(value as ThemePreference)}
                    aria-label="Appearance theme"
                  >
                    <RadioGroup.Item value="light" className={styles.radioItem}>
                      Light
                    </RadioGroup.Item>
                    <RadioGroup.Item value="dark" className={styles.radioItem}>
                      Dark
                    </RadioGroup.Item>
                    <RadioGroup.Item value="system" className={styles.radioItem}>
                      System
                    </RadioGroup.Item>
                  </RadioGroup.Root>
                </fieldset>
              </Dialog.Content>
            </motion.div>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
};

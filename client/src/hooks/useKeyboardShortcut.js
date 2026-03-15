import { useEffect } from 'react';

const useKeyboardShortcut = (keys, callback, options = {}) => {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (keys.includes('ctrl+k') && ctrlOrCmd && e.key === 'k') {
        e.preventDefault();
        callback(e);
      }
      if (keys.includes('Escape') && e.key === 'Escape') {
        callback(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keys, callback, enabled]);
};

export default useKeyboardShortcut;

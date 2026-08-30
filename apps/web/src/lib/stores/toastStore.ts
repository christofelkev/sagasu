import { writable } from 'svelte/store';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<ToastMessage[]>([]);

  function add(type: ToastMessage['type'], title: string, message: string, duration = 4000) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    update((toasts) => [...toasts, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  }

  function remove(id: string) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  return {
    subscribe,
    success: (title: string, message: string, duration?: number) => add('success', title, message, duration),
    info: (title: string, message: string, duration?: number) => add('info', title, message, duration),
    warning: (title: string, message: string, duration?: number) => add('warning', title, message, duration),
    error: (title: string, message: string, duration?: number) => add('error', title, message, duration),
    remove
  };
}

export const toasts = createToastStore();

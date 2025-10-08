import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'error';

export type ToastState = {
  id?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  type: ToastType;
  visible: boolean;
  show: (payload: {
    message: string;
    type?: ToastType;
    actionLabel?: string;
    onAction?: () => void;
    duration?: number;
  }) => void;
  hide: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  type: 'info',
  visible: false,
  show: ({ message, type = 'info', actionLabel, onAction, duration = 2500 }) => {
    const id = `${Date.now()}`;
    set({ id, message, type, actionLabel, onAction, visible: true });
    if (duration > 0) {
      setTimeout(() => {
        set((state) => (state.id === id ? { visible: false } : state));
      }, duration);
    }
  },
  hide: () => set({ visible: false })
}));

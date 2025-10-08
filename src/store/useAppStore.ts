import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ConnectorId, Operation } from '@/types';
import { storage } from '@/lib/storage';
import { getItemsPage } from '@/services/items';
import { connectorNames, describeConnectorAction } from '@/services/connectors';
import { enqueueOperation } from '@/services/actions';
import { useToastStore } from './useToastStore';

const STORAGE_ACCOUNT_KEY = 'swipeflow:account';
const STORAGE_MAP_KEY = 'swipeflow:map';
const STORAGE_UNDO_KEY = 'swipeflow:undo';
const STORAGE_HAPTIC_KEY = 'swipeflow:haptics';

export type Account = { connector: ConnectorId } | null;

type SwipeMap = {
  left: Operation['action'];
  right: Operation['action'];
};

type AppState = {
  account: Account;
  swipeMap: SwipeMap;
  deck: Operation['item'][];
  queue: Operation[];
  undoStack: Operation[];
  hasMore: boolean;
  page: number;
  loading: boolean;
  hapticsEnabled: boolean;
  init: () => Promise<void>;
  setAccount: (connector: ConnectorId | null) => Promise<void>;
  setSwipeMap: (updates: Partial<SwipeMap>) => Promise<void>;
  loadPage: () => Promise<void>;
  swipe: (direction: 'left' | 'right') => Promise<void>;
  undo: () => Promise<void>;
  retry: (operationId: string) => Promise<void>;
  clearCache: () => Promise<void>;
  setHaptics: (value: boolean) => Promise<void>;
};

const defaultSwipeMap: SwipeMap = {
  left: { type: 'Archive' },
  right: { type: 'Move', params: { list: 'Keep' } }
};

const operationHandles = new Map<string, ReturnType<typeof enqueueOperation>>();

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    account: null,
    swipeMap: defaultSwipeMap,
    deck: [],
    queue: [],
    undoStack: [],
    hasMore: true,
    page: 0,
    loading: false,
    hapticsEnabled: true,
    init: async () => {
      const [account, swipeMap, undoStack, haptics] = await Promise.all([
        storage.get<Account>(STORAGE_ACCOUNT_KEY),
        storage.get<SwipeMap>(STORAGE_MAP_KEY),
        storage.get<Operation[]>(STORAGE_UNDO_KEY),
        storage.get<boolean>(STORAGE_HAPTIC_KEY)
      ]);

      set((state) => {
        state.account = account ?? null;
        if (swipeMap) state.swipeMap = swipeMap;
        if (undoStack) state.undoStack = undoStack;
        if (typeof haptics === 'boolean') state.hapticsEnabled = haptics;
        state.page = 0;
        state.deck = [];
        state.hasMore = true;
      });

      if (account) {
        await get().loadPage();
      }
    },
    setAccount: async (connector) => {
      if (!connector) {
        set((state) => {
          state.account = null;
          state.deck = [];
          state.page = 0;
          state.hasMore = true;
          state.queue = [];
          state.undoStack = [];
        });
        await storage.remove(STORAGE_ACCOUNT_KEY);
        await storage.remove(STORAGE_UNDO_KEY);
        return;
      }

      set((state) => {
        state.account = { connector };
        state.deck = [];
        state.page = 0;
        state.hasMore = true;
        state.queue = [];
        state.undoStack = [];
      });
      await storage.set(STORAGE_ACCOUNT_KEY, { connector });
      await storage.remove(STORAGE_UNDO_KEY);
      await get().loadPage();
    },
    setSwipeMap: async (updates) => {
      set((state) => {
        state.swipeMap = { ...state.swipeMap, ...updates };
      });
      await storage.set(STORAGE_MAP_KEY, get().swipeMap);
    },
    loadPage: async () => {
      const { account, loading, hasMore, page } = get();
      if (!account || loading || !hasMore) return;
      set((state) => {
        state.loading = true;
      });
      try {
        const { items, hasMore: nextHasMore } = await getItemsPage(account.connector, page);
        set((state) => {
          state.deck.push(...items);
          state.hasMore = nextHasMore;
          state.page = state.page + 1;
        });
      } finally {
        set((state) => {
          state.loading = false;
        });
      }
    },
    swipe: async (direction) => {
      const { deck, swipeMap, account } = get();
      if (!account) return;
      if (!deck.length) {
        await get().loadPage();
        return;
      }
      const item = deck[0];
      const remaining = deck.slice(1);
      const action = swipeMap[direction];
      const now = Date.now();
      const operation: Operation = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        item,
        direction,
        action,
        status: 'pending',
        attempts: 0,
        createdAt: now,
        updatedAt: now
      };

      set((state) => {
        state.deck = remaining;
        state.queue.unshift(operation);
        state.undoStack.unshift(operation);
        state.undoStack = state.undoStack.slice(0, 10);
      });
      await storage.set(STORAGE_UNDO_KEY, get().undoStack);

      const toast = useToastStore.getState();

      const handle = enqueueOperation(operation, {
        onAttempt: (attempt) => {
          set((state) => {
            const entry = state.queue.find((op) => op.id === operation.id);
            if (entry) {
              entry.attempts = attempt;
              entry.updatedAt = Date.now();
            }
          });
        },
        onSuccess: () => {
          set((state) => {
            const entry = state.queue.find((op) => op.id === operation.id);
            if (entry) {
              entry.status = 'success';
              entry.error = undefined;
              entry.updatedAt = Date.now();
            }
          });
          operationHandles.delete(operation.id);
          toast.show({
            message: `${connectorNames[account.connector]}: ${describeConnectorAction(
              account.connector,
              action,
            )} succeeded`,
            type: 'success'
          });
        },
        onFailure: (error) => {
          set((state) => {
            const entry = state.queue.find((op) => op.id === operation.id);
            if (entry) {
              entry.status = 'failed';
              entry.error = error;
              entry.updatedAt = Date.now();
            }
          });
          operationHandles.delete(operation.id);
          toast.show({
            message: `${connectorNames[account.connector]} action failed`,
            type: 'error',
            actionLabel: 'Retry',
            onAction: () => {
              void get().retry(operation.id);
            },
            duration: 4000
          });
        }
      });

      operationHandles.set(operation.id, handle);

      if (remaining.length < 5) {
        void get().loadPage();
      }
    },
    undo: async () => {
      const { undoStack, deck, account } = get();
      if (!undoStack.length || !account) return;

      const [lastOperation, ...rest] = undoStack;
      set((state) => {
        state.undoStack = rest;
      });
      await storage.set(STORAGE_UNDO_KEY, rest);

      const handle = operationHandles.get(lastOperation.id);
      if (handle) {
        handle.cancel();
        operationHandles.delete(lastOperation.id);
      }

      set((state) => {
        state.deck = [lastOperation.item, ...deck];
        const entry = state.queue.find((op) => op.id === lastOperation.id);
        if (entry) {
          entry.status = 'success';
          entry.updatedAt = Date.now();
          entry.error = undefined;
        }
      });

      const revertOperation: Operation = {
        ...lastOperation,
        id: `${Date.now()}-undo-${Math.random().toString(36).slice(2, 8)}`,
        undo: true,
        status: 'pending',
        attempts: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      set((state) => {
        state.queue.unshift(revertOperation);
      });

      const toast = useToastStore.getState();

      const revertHandle = enqueueOperation(revertOperation, {
        onAttempt: (attempt) => {
          set((state) => {
            const entry = state.queue.find((op) => op.id === revertOperation.id);
            if (entry) {
              entry.attempts = attempt;
              entry.updatedAt = Date.now();
            }
          });
        },
        onSuccess: () => {
          set((state) => {
            const entry = state.queue.find((op) => op.id === revertOperation.id);
            if (entry) {
              entry.status = 'success';
              entry.error = undefined;
              entry.updatedAt = Date.now();
            }
          });
          operationHandles.delete(revertOperation.id);
          toast.show({ message: 'Undo successful', type: 'success' });
        },
        onFailure: (error) => {
          set((state) => {
            const entry = state.queue.find((op) => op.id === revertOperation.id);
            if (entry) {
              entry.status = 'failed';
              entry.error = error;
              entry.updatedAt = Date.now();
            }
          });
          operationHandles.delete(revertOperation.id);
          toast.show({
            message: 'Undo failed',
            type: 'error',
            actionLabel: 'Retry',
            onAction: () => void get().retry(revertOperation.id),
            duration: 4000
          });
        }
      });

      operationHandles.set(revertOperation.id, revertHandle);
    },
    retry: async (operationId) => {
      const { account } = get();
      if (!account) return;
      const existing = get().queue.find((op) => op.id === operationId);
      if (!existing) return;

      const handle = operationHandles.get(operationId);
      if (handle) {
        handle.cancel();
        operationHandles.delete(operationId);
      }

      const resetOperation: Operation = {
        ...existing,
        status: 'pending',
        attempts: existing.attempts,
        error: undefined,
        updatedAt: Date.now()
      };

      set((state) => {
        const index = state.queue.findIndex((op) => op.id === operationId);
        if (index !== -1) {
          state.queue[index] = resetOperation;
        }
      });

      const toast = useToastStore.getState();

      const newHandle = enqueueOperation(resetOperation, {
        onAttempt: (attempt) => {
          set((state) => {
            const entry = state.queue.find((op) => op.id === operationId);
            if (entry) {
              entry.attempts = attempt;
              entry.updatedAt = Date.now();
            }
          });
        },
        onSuccess: () => {
          set((state) => {
            const entry = state.queue.find((op) => op.id === operationId);
            if (entry) {
              entry.status = 'success';
              entry.error = undefined;
              entry.updatedAt = Date.now();
            }
          });
          operationHandles.delete(operationId);
          toast.show({ message: 'Action completed', type: 'success' });
        },
        onFailure: (error) => {
          set((state) => {
            const entry = state.queue.find((op) => op.id === operationId);
            if (entry) {
              entry.status = 'failed';
              entry.error = error;
              entry.updatedAt = Date.now();
            }
          });
          operationHandles.delete(operationId);
          toast.show({
            message: 'Action failed again',
            type: 'error',
            actionLabel: 'Retry',
            onAction: () => void get().retry(operationId),
            duration: 4000
          });
        }
      });

      operationHandles.set(operationId, newHandle);
    },
    clearCache: async () => {
      set((state) => {
        state.deck = [];
        state.page = 0;
        state.hasMore = true;
        state.queue = [];
        state.undoStack = [];
      });
      await storage.remove(STORAGE_UNDO_KEY);
    },
    setHaptics: async (value) => {
      set((state) => {
        state.hapticsEnabled = value;
      });
      await storage.set(STORAGE_HAPTIC_KEY, value);
    }
  })),
);

import { exponentialBackoff } from '@/lib/backoff';
import { ActionConfig, Item, Operation } from '@/types';

const FAILURE_RATE = 0.08;
const MIN_LATENCY = 200;
const MAX_LATENCY = 800;

const randomLatency = async () => {
  const duration = Math.random() * (MAX_LATENCY - MIN_LATENCY) + MIN_LATENCY;
  return new Promise((resolve) => setTimeout(resolve, duration));
};

const performAction = async (action: ActionConfig, item: Item) => {
  await randomLatency();
  if (Math.random() < FAILURE_RATE) {
    throw new Error(`Action ${action.type} failed for ${item.id}`);
  }
};

const performUndo = async (action: ActionConfig, item: Item) => {
  await randomLatency();
  if (Math.random() < FAILURE_RATE) {
    throw new Error(`Undo ${action.type} failed for ${item.id}`);
  }
};

type EnqueueCallbacks = {
  onAttempt?: (attempt: number) => void;
  onSuccess: () => void;
  onFailure: (error: string) => void;
};

type QueueHandle = {
  cancel: () => void;
};

export const enqueueOperation = (
  operation: Operation,
  callbacks: EnqueueCallbacks,
  options?: { maxAttempts?: number },
): QueueHandle => {
  const maxAttempts = options?.maxAttempts ?? 5;
  let cancelled = false;
  let timeout: NodeJS.Timeout | undefined;

  const attempt = async (attemptNumber: number) => {
    if (cancelled) return;
    callbacks.onAttempt?.(attemptNumber);
    try {
      if (operation.undo) {
        await performUndo(operation.action, operation.item);
      } else {
        await performAction(operation.action, operation.item);
      }
      if (!cancelled) {
        callbacks.onSuccess();
      }
    } catch (error) {
      if (cancelled) return;
      if (attemptNumber >= maxAttempts) {
        callbacks.onFailure(error instanceof Error ? error.message : 'Unknown error');
        return;
      }
      const delay = exponentialBackoff(attemptNumber + 1);
      timeout = setTimeout(() => attempt(attemptNumber + 1), delay);
    }
  };

  attempt(Math.max(1, operation.attempts + 1));

  return {
    cancel: () => {
      cancelled = true;
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  };
};

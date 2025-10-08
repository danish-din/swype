export type ConnectorId = 'trello' | 'gmail' | 'notion';

export type ActionType = 'Move' | 'Tag' | 'Archive' | 'DoNothing';

export type ActionConfig = {
  type: ActionType;
  params?: Record<string, string>;
  label?: string;
};

export type Item = {
  id: string;
  title: string;
  preview?: string;
  thumbnailUrl?: string;
  meta?: Record<string, any>;
};

export type OperationStatus = 'pending' | 'success' | 'failed';

export type Operation = {
  id: string;
  item: Item;
  direction: 'left' | 'right';
  action: ActionConfig;
  status: OperationStatus;
  error?: string;
  attempts: number;
  createdAt: number;
  updatedAt: number;
  undo?: boolean;
};

import { ActionConfig } from '@/types';

export const trelloPresets = {
  lists: ['Inbox', 'Keep', 'Later'],
  tags: ['Today', 'Research', 'Waiting']
};

export const trelloActions: ActionConfig[] = [
  { type: 'Move', params: { list: 'Inbox' }, label: 'Move → Inbox' },
  { type: 'Move', params: { list: 'Keep' }, label: 'Move → Keep' },
  { type: 'Move', params: { list: 'Later' }, label: 'Move → Later' },
  { type: 'Tag', params: { tag: 'Today' }, label: 'Tag Today' },
  { type: 'Tag', params: { tag: 'Research' }, label: 'Tag Research' },
  { type: 'Archive', label: 'Archive card' },
  { type: 'DoNothing', label: 'Do nothing' }
];

export const describeAction = (config: ActionConfig): string => {
  switch (config.type) {
    case 'Move':
      return `Move to ${config.params?.list ?? 'list'}`;
    case 'Tag':
      return `Add tag ${config.params?.tag ?? ''}`.trim();
    case 'Archive':
      return 'Archive card';
    default:
      return 'Do nothing';
  }
};

export const availableActions = (): ActionConfig[] => trelloActions;

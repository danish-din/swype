import { ActionConfig } from '@/types';

export const notionPresets = {
  databases: ['Ideas', 'Backlog'],
  tags: ['Inspiration', 'Needs Research']
};

export const notionActions: ActionConfig[] = [
  { type: 'Move', params: { database: 'Ideas' }, label: 'Move → Ideas' },
  { type: 'Move', params: { database: 'Backlog' }, label: 'Move → Backlog' },
  { type: 'Tag', params: { tag: 'Inspiration' }, label: 'Tag Inspiration' },
  { type: 'Tag', params: { tag: 'Needs Research' }, label: 'Tag Needs Research' },
  { type: 'DoNothing', label: 'Do nothing' }
];

export const describeAction = (config: ActionConfig): string => {
  switch (config.type) {
    case 'Move':
      return `Move to ${config.params?.database ?? 'database'}`;
    case 'Tag':
      return `Add tag ${config.params?.tag ?? ''}`.trim();
    case 'Archive':
      return 'Archive page';
    default:
      return 'Do nothing';
  }
};

export const availableActions = (): ActionConfig[] => notionActions;

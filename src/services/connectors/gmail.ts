import { ActionConfig } from '@/types';

export const gmailPresets = {
  labels: ['Starred', 'ReadLater', 'Archive']
};

export const gmailActions: ActionConfig[] = [
  { type: 'Tag', params: { label: 'Starred' }, label: 'Label Starred' },
  { type: 'Tag', params: { label: 'ReadLater' }, label: 'Label Read Later' },
  { type: 'Archive', label: 'Archive email' },
  { type: 'DoNothing', label: 'Do nothing' }
];

export const describeAction = (config: ActionConfig): string => {
  switch (config.type) {
    case 'Tag':
      return `Apply label ${config.params?.label ?? ''}`.trim();
    case 'Archive':
      return 'Archive conversation';
    default:
      return 'Do nothing';
  }
};

export const availableActions = (): ActionConfig[] => gmailActions;

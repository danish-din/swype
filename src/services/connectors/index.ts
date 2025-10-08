import { ActionConfig, ConnectorId } from '@/types';
import { availableActions as trelloActions, describeAction as describeTrello } from './trello';
import { availableActions as gmailActions, describeAction as describeGmail } from './gmail';
import { availableActions as notionActions, describeAction as describeNotion } from './notion';

export const connectorNames: Record<ConnectorId, string> = {
  trello: 'Trello',
  gmail: 'Gmail',
  notion: 'Notion'
};

export const connectorActions: Record<ConnectorId, () => ActionConfig[]> = {
  trello: trelloActions,
  gmail: gmailActions,
  notion: notionActions
};

export const describeConnectorAction = (
  connector: ConnectorId,
  action: ActionConfig,
): string => {
  switch (connector) {
    case 'trello':
      return describeTrello(action);
    case 'gmail':
      return describeGmail(action);
    case 'notion':
      return describeNotion(action);
    default:
      return action.label ?? action.type;
  }
};

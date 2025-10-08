import { ConnectorId, Item } from '@/types';

const ITEM_COUNT = 50;
const PAGE_SIZE = 10;

const generateItems = (connector: ConnectorId): Item[] => {
  const suffix = connector.toUpperCase();
  return new Array(ITEM_COUNT).fill(null).map((_, index) => {
    const id = `${connector}-${index + 1}`;
    return {
      id,
      title: `${suffix} Item #${index + 1}`,
      preview: `This is a mocked preview for ${suffix} item ${index + 1}.`,
      thumbnailUrl: undefined,
      meta: {
        connector,
        position: index + 1
      }
    } satisfies Item;
  });
};

const cache = new Map<ConnectorId, Item[]>();

export const getItemsPage = async (
  connector: ConnectorId,
  page: number,
): Promise<{ items: Item[]; hasMore: boolean }> => {
  if (!cache.has(connector)) {
    cache.set(connector, generateItems(connector));
  }

  const items = cache.get(connector)!;
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const slice = items.slice(start, end);
  const hasMore = end < items.length;

  await new Promise((resolve) => setTimeout(resolve, 150));

  return { items: slice, hasMore };
};

export const pageSize = PAGE_SIZE;

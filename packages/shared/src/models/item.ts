export type ItemCategoryId = string;

export interface ItemCategoryDefinition {
  id: ItemCategoryId;
  name: string;
}

export const ITEM_CATEGORIES: readonly ItemCategoryDefinition[] = [
  {
    id: 'clothes',
    name: 'Clothes',
  },
  {
    id: 'electronics',
    name: 'Electronics',
  },
  {
    id: 'toiletries',
    name: 'Toiletries',
  },
  {
    id: 'documents',
    name: 'Documents',
  },
  {
    id: 'tools',
    name: 'Tools',
  },
];

export interface Item {
  id: string;
  name: string;
  notes?: string;
  categoryId?: ItemCategoryId;
  mandatory: boolean;
  activityIds: string[];
  createdAt: string;
  updatedAt: string;
}

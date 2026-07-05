export type ItemCategoryId = 'clothes' | 'electronics' | 'toiletries' | 'documents' | 'tools';

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
  description?: string;
  categoryId?: ItemCategoryId;
  weight?: string;
  size?: string;
  notes?: string;
  mandatory: boolean;
  activityIds: string[];
  createdAt: string;
  updatedAt: string;
}

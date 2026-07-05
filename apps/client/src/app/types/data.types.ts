import type { Activity, Item } from '@packwise/shared';

export interface PackwiseDataSnapshot {
  id: string;
  version: number;
  activities: Activity[];
  items: Item[];
}

export type CreateActivityInput = Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateActivityInput = Partial<CreateActivityInput>;

export type CreateItemInput = Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'activityIds'> & {
  activityIds?: string[];
};

export type UpdateItemInput = Partial<CreateItemInput>;

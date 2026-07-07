export interface Trip {
  id: string;
  name: string;
  notes?: string;
  activityIds: string[];
  packedItemIds: string[];
  createdAt: string;
  updatedAt: string;
}

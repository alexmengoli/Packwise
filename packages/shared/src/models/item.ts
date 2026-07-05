export interface Item {
  id: string;
  name: string;
  description?: string;
  weight?: string;
  size?: string;
  notes?: string;
  mandatory: boolean;
  activityIds: string[];
  createdAt: string;
  updatedAt: string;
}

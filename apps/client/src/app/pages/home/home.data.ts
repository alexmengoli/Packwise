import type { Activity, Item } from '@packwise/shared';

const CREATED_AT: string = '2026-01-01T00:00:00.000Z';

export const STARTER_ACTIVITIES: Activity[] = [
  {
    id: 'starter-camping',
    name: 'Camping',
    color: '#0f766e',
    icon: 'forest',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-beach',
    name: 'Beach',
    color: '#0284c7',
    icon: 'beach_access',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-mtb',
    name: 'MTB',
    color: '#ca8a04',
    icon: 'pedal_bike',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-gym',
    name: 'Gym',
    color: '#7c3aed',
    icon: 'fitness_center',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
];

export const STARTER_ITEMS: Item[] = [
  {
    id: 'starter-tent',
    name: 'Tent',
    description: 'Check poles and stakes before leaving.',
    activityIds: ['starter-camping'],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-water-bottle',
    name: 'Water bottle',
    activityIds: ['starter-camping', 'starter-beach', 'starter-mtb', 'starter-gym'],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-sunscreen',
    name: 'Sunscreen',
    description: 'SPF 50 if you will stay outside for a while.',
    activityIds: ['starter-camping', 'starter-beach', 'starter-mtb'],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-repair-kit',
    name: 'Repair kit',
    activityIds: ['starter-mtb'],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-towel',
    name: 'Towel',
    activityIds: ['starter-beach', 'starter-gym'],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
];

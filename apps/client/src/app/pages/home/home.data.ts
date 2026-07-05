import type { Activity, Item } from '@packwise/shared';

const CREATED_AT: string = '2026-01-01T00:00:00.000Z';

export const STARTER_ACTIVITIES: Activity[] = [
  {
    id: 'starter-camping',
    name: 'Camping',
    color: 'hsl(177 88% 31%)',
    icon: 'forest',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-beach',
    name: 'Beach',
    color: 'hsl(199 88% 31%)',
    icon: 'beach_access',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-mtb',
    name: 'MTB',
    color: 'hsl(39 88% 31%)',
    icon: 'pedal_bike',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-gym',
    name: 'Gym',
    color: 'hsl(263 88% 31%)',
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
    mandatory: false,
    activityIds: ['starter-camping'],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-water-bottle',
    name: 'Water bottle',
    mandatory: true,
    activityIds: [],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-sunscreen',
    name: 'Sunscreen',
    description: 'SPF 50 if you will stay outside for a while.',
    mandatory: false,
    activityIds: ['starter-camping', 'starter-beach', 'starter-mtb'],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-repair-kit',
    name: 'Repair kit',
    mandatory: false,
    activityIds: ['starter-mtb'],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'starter-towel',
    name: 'Towel',
    mandatory: false,
    activityIds: ['starter-beach', 'starter-gym'],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
];

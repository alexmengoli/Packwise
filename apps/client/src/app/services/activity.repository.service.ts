import { Injectable, type Signal, type WritableSignal, inject, signal } from '@angular/core';
import type { Activity, Item } from '@packwise/shared';

import type {
  CreateActivityInput,
  PackwiseDataSnapshot,
  UpdateActivityInput,
} from '../types/data.types';
import { IndexedDbPackwiseStorageAdapterService } from './indexed-db-packwise-storage.adapter.service';
import { ItemRepositoryService } from './item.repository.service';

@Injectable({ providedIn: 'root' })
export class ActivityRepositoryService {
  // injections
  private readonly storage = inject(IndexedDbPackwiseStorageAdapterService);
  private readonly itemRepository = inject(ItemRepositoryService);

  // state
  private readonly activitiesSignal: WritableSignal<Activity[]> = signal<Activity[]>([]);
  private readonly loadingSignal: WritableSignal<boolean> = signal<boolean>(true);
  private readonly errorSignal: WritableSignal<unknown> = signal<unknown>(null);
  private readonly initialLoad: Promise<void>;

  // data
  public readonly activities: Signal<Activity[]> = this.activitiesSignal.asReadonly();
  public readonly loading: Signal<boolean> = this.loadingSignal.asReadonly();
  public readonly error: Signal<unknown> = this.errorSignal.asReadonly();

  constructor() {
    this.initialLoad = this.refresh();
  }

  public async refresh(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
      this.activitiesSignal.set(sortActivities(snapshot.activities));
    } catch (error: unknown) {
      this.errorSignal.set(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  public async createActivity(input: CreateActivityInput): Promise<Activity> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const now: string = new Date().toISOString();
    const activity: Activity = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      activities: sortActivities([...snapshot.activities, activity]),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.activitiesSignal.set(updatedSnapshot.activities);

    return activity;
  }

  public async updateActivity(id: string, input: UpdateActivityInput): Promise<Activity> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const currentActivity: Activity = findActivity(snapshot.activities, id);
    const updatedActivity: Activity = {
      ...currentActivity,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      activities: sortActivities(
        snapshot.activities.map((activity: Activity): Activity =>
          activity.id === updatedActivity.id ? updatedActivity : activity,
        ),
      ),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.activitiesSignal.set(updatedSnapshot.activities);

    return updatedActivity;
  }

  public async deleteActivity(id: string): Promise<void> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const now: string = new Date().toISOString();
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      activities: snapshot.activities.filter((activity: Activity): boolean => activity.id !== id),
      items: snapshot.items.map((item: Item): Item =>
        item.activityIds.includes(id)
          ? {
              ...item,
              activityIds: item.activityIds.filter(
                (activityId: string): boolean => activityId !== id,
              ),
              updatedAt: now,
            }
          : item,
      ),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.activitiesSignal.set(sortActivities(updatedSnapshot.activities));
    await this.itemRepository.refresh();
  }
}

function findActivity(activities: Activity[], id: string): Activity {
  const activity: Activity | undefined = activities.find(
    (currentActivity: Activity): boolean => currentActivity.id === id,
  );

  if (!activity) {
    throw new Error(`Activity not found: ${id}`);
  }

  return activity;
}

function sortActivities(activities: Activity[]): Activity[] {
  return [...activities].sort((first: Activity, second: Activity): number =>
    first.name.localeCompare(second.name),
  );
}

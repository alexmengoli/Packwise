import { Injectable, type Signal, type WritableSignal, inject, signal } from '@angular/core';

import type { Item } from '@packwise/shared';
import type {
  CreateItemInput,
  PackwiseDataSnapshot,
  UpdateItemInput,
} from '../types/data.types';
import { IndexedDbPackwiseStorageAdapterService } from './indexed-db-packwise-storage.adapter.service';

@Injectable({ providedIn: 'root' })
export class ItemRepositoryService {
  // injections
  private readonly storage = inject(IndexedDbPackwiseStorageAdapterService);

  // state
  private readonly itemsSignal: WritableSignal<Item[]> = signal<Item[]>([]);
  private readonly loadingSignal: WritableSignal<boolean> = signal<boolean>(true);
  private readonly errorSignal: WritableSignal<unknown> = signal<unknown>(null);
  private readonly initialLoad: Promise<void>;

  // data
  public readonly items: Signal<Item[]> = this.itemsSignal.asReadonly();
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
      this.itemsSignal.set(sortItems(snapshot.items));
    } catch (error: unknown) {
      this.errorSignal.set(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  public async createItem(input: CreateItemInput): Promise<Item> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const now: string = new Date().toISOString();
    const item: Item = {
      ...input,
      id: crypto.randomUUID(),
      activityIds: [...input.activityIds],
      createdAt: now,
      updatedAt: now,
    };
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      items: sortItems([...snapshot.items, item]),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.itemsSignal.set(updatedSnapshot.items);

    return item;
  }

  public async updateItem(id: string, input: UpdateItemInput): Promise<Item> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const currentItem: Item = findItem(snapshot.items, id);
    const updatedItem: Item = {
      ...currentItem,
      ...input,
      activityIds: input.activityIds ? [...input.activityIds] : currentItem.activityIds,
      updatedAt: new Date().toISOString(),
    };
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      items: sortItems(
        snapshot.items.map((item: Item): Item => (item.id === updatedItem.id ? updatedItem : item)),
      ),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.itemsSignal.set(updatedSnapshot.items);

    return updatedItem;
  }

  public async deleteItem(id: string): Promise<void> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      items: snapshot.items.filter((item: Item): boolean => item.id !== id),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.itemsSignal.set(sortItems(updatedSnapshot.items));
  }

  public async removeActivityReference(activityId: string): Promise<void> {
    await this.initialLoad;

    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const affectedItems: Item[] = snapshot.items.filter((item: Item): boolean =>
      item.activityIds.includes(activityId),
    );

    if (affectedItems.length === 0) {
      return;
    }

    const now: string = new Date().toISOString();
    const updatedSnapshot: PackwiseDataSnapshot = {
      ...snapshot,
      items: sortItems(
        snapshot.items.map((item: Item): Item =>
          item.activityIds.includes(activityId)
            ? {
                ...item,
                activityIds: item.activityIds.filter((id: string): boolean => id !== activityId),
                updatedAt: now,
              }
            : item,
        ),
      ),
    };

    await this.storage.saveSnapshot(updatedSnapshot);
    this.itemsSignal.set(updatedSnapshot.items);
  }
}

function findItem(items: Item[], id: string): Item {
  const item: Item | undefined = items.find((currentItem: Item): boolean => currentItem.id === id);

  if (!item) {
    throw new Error(`Packing item not found: ${id}`);
  }

  return item;
}

function sortItems(items: Item[]): Item[] {
  return [...items].sort((first: Item, second: Item): number =>
    first.name.localeCompare(second.name),
  );
}

import { Injectable } from '@angular/core';
import type { Activity, Item } from '@packwise/shared';

import type { PackwiseDataSnapshot } from '../types/data.types';

// constants
const DATABASE_NAME: string = 'packwise';
const DATABASE_VERSION: number = 1;
const SNAPSHOTS_STORE: string = 'snapshots';
const ACTIVITIES_STORE: string = 'activities';
const ITEMS_STORE: string = 'items';
const LOCAL_SNAPSHOT_ID: string = 'local';
const SNAPSHOT_VERSION: number = 1;

@Injectable({ providedIn: 'root' })
export class IndexedDbPackwiseStorageAdapterService {
  // data
  private databasePromise?: Promise<IDBDatabase>;

  public async loadSnapshot(): Promise<PackwiseDataSnapshot> {
    const database: IDBDatabase = await this.openDatabase();
    const storedSnapshot: PackwiseDataSnapshot | undefined = await this.getSnapshot(database);

    if (storedSnapshot) {
      return storedSnapshot;
    }

    const legacySnapshot: PackwiseDataSnapshot | undefined =
      await this.createLegacySnapshot(database);

    if (legacySnapshot) {
      await this.saveSnapshot(legacySnapshot);

      return legacySnapshot;
    }

    const emptySnapshot: PackwiseDataSnapshot = this.createEmptySnapshot();
    await this.saveSnapshot(emptySnapshot);

    return emptySnapshot;
  }

  public async saveSnapshot(snapshot: PackwiseDataSnapshot): Promise<void> {
    const database: IDBDatabase = await this.openDatabase();
    const store: IDBObjectStore = this.getObjectStore(database, SNAPSHOTS_STORE, 'readwrite');

    await new Promise<void>((resolve: () => void, reject: (reason?: unknown) => void) => {
      const request: IDBRequest<IDBValidKey> = store.put(snapshot);

      request.onsuccess = (): void => resolve();
      request.onerror = (): void => reject(request.error);
    });
  }

  private openDatabase(): Promise<IDBDatabase> {
    this.databasePromise ??= new Promise<IDBDatabase>(
      (resolve: (value: IDBDatabase) => void, reject: (reason?: unknown) => void) => {
        const request: IDBOpenDBRequest = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        request.onupgradeneeded = (): void => {
          const database: IDBDatabase = request.result;

          if (!database.objectStoreNames.contains(SNAPSHOTS_STORE)) {
            database.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'id' });
          }
        };

        request.onsuccess = (): void => resolve(request.result);
        request.onerror = (): void => reject(request.error);
      },
    );

    return this.databasePromise;
  }

  private async getSnapshot(database: IDBDatabase): Promise<PackwiseDataSnapshot | undefined> {
    const store: IDBObjectStore = this.getObjectStore(database, SNAPSHOTS_STORE, 'readonly');

    return new Promise<PackwiseDataSnapshot | undefined>(
      (
        resolve: (value: PackwiseDataSnapshot | undefined) => void,
        reject: (reason?: unknown) => void,
      ) => {
        const request: IDBRequest<PackwiseDataSnapshot | undefined> = store.get(LOCAL_SNAPSHOT_ID);

        request.onsuccess = (): void => resolve(request.result);
        request.onerror = (): void => reject(request.error);
      },
    );
  }

  private async createLegacySnapshot(
    database: IDBDatabase,
  ): Promise<PackwiseDataSnapshot | undefined> {
    const hasActivitiesStore: boolean = database.objectStoreNames.contains(ACTIVITIES_STORE);
    const hasItemsStore: boolean = database.objectStoreNames.contains(ITEMS_STORE);

    if (!hasActivitiesStore && !hasItemsStore) {
      return undefined;
    }

    const activities: Activity[] = hasActivitiesStore
      ? await this.getAll<Activity>(database, ACTIVITIES_STORE)
      : [];
    const items: Item[] = hasItemsStore ? await this.getAll<Item>(database, ITEMS_STORE) : [];

    return {
      id: LOCAL_SNAPSHOT_ID,
      version: SNAPSHOT_VERSION,
      activities,
      items,
    };
  }

  private async getAll<T>(database: IDBDatabase, storeName: string): Promise<T[]> {
    const store: IDBObjectStore = this.getObjectStore(database, storeName, 'readonly');

    return new Promise<T[]>((resolve: (value: T[]) => void, reject: (reason?: unknown) => void) => {
      const request: IDBRequest<T[]> = store.getAll() as IDBRequest<T[]>;

      request.onsuccess = (): void => resolve(request.result);
      request.onerror = (): void => reject(request.error);
    });
  }

  private getObjectStore(
    database: IDBDatabase,
    storeName: string,
    mode: IDBTransactionMode,
  ): IDBObjectStore {
    const transaction: IDBTransaction = database.transaction(storeName, mode);

    return transaction.objectStore(storeName);
  }

  private createEmptySnapshot(): PackwiseDataSnapshot {
    return {
      id: LOCAL_SNAPSHOT_ID,
      version: SNAPSHOT_VERSION,
      activities: [],
      items: [],
    };
  }
}

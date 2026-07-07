import { Injectable, inject } from '@angular/core';
import type { Activity, Item, Trip } from '@packwise/shared';

import type { PackwiseDataExport } from '../types/data-import-export.types';
import type { PackwiseDataSnapshot } from '../types/data.types';
import { IndexedDbPackwiseStorageAdapterService } from './indexed-db-packwise-storage.adapter.service';

// constants
const EXPORT_VERSION: number = 1;
const LOCAL_SNAPSHOT_ID: string = 'local';

@Injectable({ providedIn: 'root' })
export class DataPortabilityService {
  // injections
  private readonly storage = inject(IndexedDbPackwiseStorageAdapterService);

  public async createExportJson(): Promise<string> {
    const snapshot: PackwiseDataSnapshot = await this.storage.loadSnapshot();
    const exportData: PackwiseDataExport = {
      app: 'packwise',
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      data: snapshot,
    };

    return JSON.stringify(exportData, null, 2);
  }

  public async importJson(json: string): Promise<void> {
    const parsedData: unknown = JSON.parse(json);
    const snapshot: PackwiseDataSnapshot = normalizeSnapshot(parsedData);

    await this.storage.saveSnapshot(snapshot);
  }

  public async deleteAllData(): Promise<void> {
    await this.storage.saveSnapshot(createEmptySnapshot());
  }
}

function normalizeSnapshot(data: unknown): PackwiseDataSnapshot {
  const snapshot: unknown = isExportEnvelope(data) ? data.data : data;

  if (!isSnapshot(snapshot)) {
    throw new Error('The selected file is not a valid Packwise JSON export.');
  }

  return {
    id: LOCAL_SNAPSHOT_ID,
    version: EXPORT_VERSION,
    activities: snapshot.activities,
    items: snapshot.items,
    trips: snapshot.trips ?? [],
  };
}

function createEmptySnapshot(): PackwiseDataSnapshot {
  return {
    id: LOCAL_SNAPSHOT_ID,
    version: EXPORT_VERSION,
    activities: [],
    items: [],
    trips: [],
  };
}

function isExportEnvelope(data: unknown): data is PackwiseDataExport {
  return (
    isRecord(data) &&
    data['app'] === 'packwise' &&
    typeof data['version'] === 'number' &&
    typeof data['exportedAt'] === 'string' &&
    isSnapshot(data['data'])
  );
}

function isSnapshot(data: unknown): data is PackwiseDataSnapshot {
  return (
    isRecord(data) &&
    typeof data['id'] === 'string' &&
    typeof data['version'] === 'number' &&
    Array.isArray(data['activities']) &&
    data['activities'].every(isActivity) &&
    Array.isArray(data['items']) &&
    data['items'].every(isItem) &&
    (data['trips'] === undefined || (Array.isArray(data['trips']) && data['trips'].every(isTrip)))
  );
}

function isActivity(data: unknown): data is Activity {
  return (
    isRecord(data) &&
    typeof data['id'] === 'string' &&
    typeof data['name'] === 'string' &&
    isOptionalString(data['notes']) &&
    isOptionalString(data['color']) &&
    isOptionalString(data['icon']) &&
    typeof data['createdAt'] === 'string' &&
    typeof data['updatedAt'] === 'string'
  );
}

function isItem(data: unknown): data is Item {
  return (
    isRecord(data) &&
    typeof data['id'] === 'string' &&
    typeof data['name'] === 'string' &&
    isOptionalString(data['notes']) &&
    isOptionalString(data['categoryId']) &&
    typeof data['mandatory'] === 'boolean' &&
    Array.isArray(data['activityIds']) &&
    data['activityIds'].every((activityId: unknown): activityId is string => typeof activityId === 'string') &&
    typeof data['createdAt'] === 'string' &&
    typeof data['updatedAt'] === 'string'
  );
}

function isTrip(data: unknown): data is Trip {
  return (
    isRecord(data) &&
    typeof data['id'] === 'string' &&
    typeof data['name'] === 'string' &&
    isOptionalString(data['notes']) &&
    Array.isArray(data['activityIds']) &&
    data['activityIds'].every((activityId: unknown): activityId is string => typeof activityId === 'string') &&
    Array.isArray(data['packedItemIds']) &&
    data['packedItemIds'].every((itemId: unknown): itemId is string => typeof itemId === 'string') &&
    typeof data['createdAt'] === 'string' &&
    typeof data['updatedAt'] === 'string'
  );
}

function isOptionalString(data: unknown): data is string | undefined {
  return data === undefined || typeof data === 'string';
}

function isRecord(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null;
}

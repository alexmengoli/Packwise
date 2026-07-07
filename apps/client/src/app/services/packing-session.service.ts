import { Injectable } from '@angular/core';

// constants
const PACKED_ITEM_IDS_KEY: string = 'packwise.packingSession.packedItemIds';
const SELECTED_ACTIVITY_IDS_KEY: string = 'packwise.packingSession.selectedActivityIds';

@Injectable({ providedIn: 'root' })
export class PackingSessionService {
  public loadSelectedActivityIds(): string[] {
    try {
      const storedValue: string | null = sessionStorage.getItem(SELECTED_ACTIVITY_IDS_KEY);

      if (!storedValue) {
        return [];
      }

      return normalizeIds(JSON.parse(storedValue));
    } catch {
      return [];
    }
  }

  public saveSelectedActivityIds(activityIds: string[]): void {
    try {
      sessionStorage.setItem(SELECTED_ACTIVITY_IDS_KEY, JSON.stringify(normalizeIds(activityIds)));
    } catch {
      return;
    }
  }

  public loadPackedItemIds(): string[] {
    try {
      const storedValue: string | null = sessionStorage.getItem(PACKED_ITEM_IDS_KEY);

      if (!storedValue) {
        return [];
      }

      return normalizeIds(JSON.parse(storedValue));
    } catch {
      return [];
    }
  }

  public savePackedItemIds(itemIds: string[]): void {
    try {
      sessionStorage.setItem(PACKED_ITEM_IDS_KEY, JSON.stringify(normalizeIds(itemIds)));
    } catch {
      return;
    }
  }

  public clearPackedItemIds(): void {
    try {
      sessionStorage.removeItem(PACKED_ITEM_IDS_KEY);
    } catch {
      return;
    }
  }
}

function normalizeIds(data: unknown): string[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return [...new Set(data.filter((id: unknown): id is string => typeof id === 'string'))];
}

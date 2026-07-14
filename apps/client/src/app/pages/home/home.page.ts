import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ITEM_CATEGORIES, type Activity, type Item, type Trip } from '@packwise/shared';
import { ActivityDetailsDialogComponent } from '../../components/activity-details-dialog/activity-details-dialog.component';
import type {
  ActivityDetailsDialogData,
  ActivityDetailsDialogResult,
} from '../../components/activity-details-dialog/activity-details-dialog.types';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import type { ConfirmationDialogData } from '../../components/confirmation-dialog/confirmation-dialog.types';
import { ItemDetailsDialogComponent } from '../../components/item-details-dialog/item-details-dialog.component';
import type {
  ItemDetailsDialogData,
  ItemDetailsDialogResult,
} from '../../components/item-details-dialog/item-details-dialog.types';
import { TripDetailsDialogComponent } from '../../components/trip-details-dialog/trip-details-dialog.component';
import type {
  TripDetailsDialogData,
  TripDetailsDialogResult,
} from '../../components/trip-details-dialog/trip-details-dialog.types';
import { ActivityRepositoryService } from '../../services/activity.repository.service';
import { ItemRepositoryService } from '../../services/item.repository.service';
import { PackingSessionService } from '../../services/packing-session.service';
import { TripRepositoryService } from '../../services/trip.repository.service';
import type { CreateActivityInput, CreateItemInput, CreateTripInput } from '../../types/data.types';
import type { PackingItemCategoryGroup, PackingItemCategoryId } from '../../types/packing-item-category.types';

// constants
const UNCATEGORIZED_CATEGORY: Pick<PackingItemCategoryGroup, 'id' | 'name'> = {
  id: 'uncategorized',
  name: 'Uncategorized',
};

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatCardModule, MatCheckboxModule, MatIconModule, MatMenuModule, MatProgressBarModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage {
  // injections
  private readonly activityRepository = inject(ActivityRepositoryService);
  private readonly dialog = inject(MatDialog);
  private readonly itemRepository = inject(ItemRepositoryService);
  private readonly packingSession = inject(PackingSessionService);
  private readonly tripRepository = inject(TripRepositoryService);

  // state
  private readonly activeTripIdSignal = signal<string | undefined>(this.packingSession.loadActiveTripId());
  private readonly selectedActivityIdsSignal = signal<string[]>(this.packingSession.loadSelectedActivityIds());
  private readonly packedItemIdsSignal = signal<string[]>(this.packingSession.loadPackedItemIds());

  // data
  protected readonly loading = computed(
    (): boolean => this.activityRepository.loading() || this.itemRepository.loading() || this.tripRepository.loading(),
  );
  protected readonly activities = this.activityRepository.activities;
  protected readonly items = this.itemRepository.items;
  protected readonly trips = this.tripRepository.trips;
  protected readonly activeTrip = computed((): Trip | undefined => {
    const activeTripId: string | undefined = this.activeTripIdSignal();

    return activeTripId ? this.trips().find((trip: Trip): boolean => trip.id === activeTripId) : undefined;
  });
  protected readonly selectedActivityIds = computed((): string[] => this.activeTrip()?.activityIds ?? this.selectedActivityIdsSignal());
  protected readonly packedItemIds = computed((): string[] => this.activeTrip()?.packedItemIds ?? this.packedItemIdsSignal());
  protected readonly hasPackedItems = computed((): boolean => this.packedItemIds().length > 0);
  protected readonly packingItems = computed((): Item[] => {
    const selectedActivityIds: string[] = this.selectedActivityIds();

    if (selectedActivityIds.length === 0) {
      return [];
    }

    return this.items().filter(
      (item: Item): boolean =>
        item.mandatory ||
        item.activityIds.some((activityId: string): boolean => selectedActivityIds.includes(activityId)),
    );
  });
  protected readonly packedPackingItemCount = computed((): number => {
    const packedItemIds: string[] = this.packedItemIds();

    return this.packingItems().filter((item: Item): boolean => packedItemIds.includes(item.id)).length;
  });
  protected readonly packingProgress = computed(
    (): number => (this.packedPackingItemCount() / this.packingItems().length) * 100,
  );
  protected readonly hasCategorizedPackingItems = computed((): boolean =>
    this.packingItems().some((item: Item): boolean => Boolean(item.categoryId)),
  );
  protected readonly packingItemGroups = computed((): PackingItemCategoryGroup[] =>
    groupPackingItemsByCategory(this.packingItems()),
  );

  protected activityIcon(activity: Activity): string {
    return activity.icon ?? 'hiking';
  }

  protected itemCount(activityId: string): number {
    return this.items().filter((item: Item): boolean => item.mandatory || item.activityIds.includes(activityId)).length;
  }

  protected closeTrip(): void {
    this.activeTripIdSignal.set(undefined);
    this.packingSession.clearActiveTripId();
  }

  protected openTrip(trip: Trip): void {
    this.activeTripIdSignal.set(trip.id);
    this.packingSession.saveActiveTripId(trip.id);
  }

  protected saveCurrentTrip(): void {
    this.openTripDialog();
  }

  protected editTrip(trip: Trip): void {
    this.openTripDialog(trip);
  }

  protected deleteTrip(trip: Trip): void {
    this.dialog
      .open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(ConfirmationDialogComponent, {
        data: {
          title: 'Delete trip?',
          message: `Delete ${trip.name}? Your items and activities will stay in your library.`,
          confirmLabel: 'Delete',
          confirmTone: 'danger',
        },
        maxWidth: 'calc(100vw - 1rem)',
        width: '28rem',
      })
      .afterClosed()
      .subscribe((confirmed: boolean | undefined): void => {
        if (!confirmed) {
          return;
        }

        if (this.activeTripIdSignal() === trip.id) {
          this.activeTripIdSignal.set(undefined);
          this.packingSession.clearActiveTripId();
        }

        void this.tripRepository.deleteTrip(trip.id).catch((error: unknown): void => console.error(error));
      });
  }

  protected createActivity(): void {
    this.dialog
      .open<ActivityDetailsDialogComponent, ActivityDetailsDialogData, ActivityDetailsDialogResult | undefined>(
        ActivityDetailsDialogComponent,
        {
          data: {
            findDuplicateActivity: (name: string, ignoredActivityId?: string): Activity | undefined =>
              this.findActivityByName(name, ignoredActivityId),
          },
          maxWidth: 'calc(100vw - 1rem)',
          width: '38rem',
        },
      )
      .afterClosed()
      .subscribe((result: ActivityDetailsDialogResult | undefined): void => {
        if (!result) {
          return;
        }

        if (result.openActivityId) {
          this.openExistingActivityById(result.openActivityId);

          return;
        }

        if (result.input) {
          void this.saveActivity(result.input, result.activityId).catch((error: unknown): void => console.error(error));
        }
      });
  }

  protected createItem(): void {
    this.dialog
      .open<ItemDetailsDialogComponent, ItemDetailsDialogData, ItemDetailsDialogResult | undefined>(
        ItemDetailsDialogComponent,
        {
          maxWidth: 'calc(100vw - 1rem)',
          width: '38rem',
          data: {
            activities: this.activities(),
            activityIds: this.selectedActivityIds(),
            findDuplicateItem: (name: string, ignoredItemId?: string): Item | undefined =>
              this.findItemByName(name, ignoredItemId),
          },
        },
      )
      .afterClosed()
      .subscribe((result: ItemDetailsDialogResult | undefined): void => {
        if (!result) {
          return;
        }

        if (result.openItemId) {
          this.openExistingItemById(result.openItemId);

          return;
        }

        if (result.input) {
          void this.saveItem(result.input, result.itemId).catch((error: unknown): void => console.error(error));
        }
      });
  }

  protected toggleActivity(activityId: string): void {
    const selectedActivityIds: string[] = this.toggleId(this.selectedActivityIds(), activityId);
    const activeTrip: Trip | undefined = this.activeTrip();

    if (activeTrip) {
      void this.tripRepository
        .updateTrip(activeTrip.id, { activityIds: selectedActivityIds })
        .catch((error: unknown): void => console.error(error));

      return;
    }

    this.selectedActivityIdsSignal.set(selectedActivityIds);
    this.packingSession.saveSelectedActivityIds(selectedActivityIds);
  }

  protected togglePacked(itemId: string): void {
    const packedItemIds: string[] = this.toggleId(this.packedItemIds(), itemId);
    const activeTrip: Trip | undefined = this.activeTrip();

    if (activeTrip) {
      void this.tripRepository
        .updateTrip(activeTrip.id, { packedItemIds })
        .catch((error: unknown): void => console.error(error));

      return;
    }

    this.packedItemIdsSignal.set(packedItemIds);
    this.packingSession.savePackedItemIds(packedItemIds);
  }

  protected clearPackedItems(): void {
    const activeTrip: Trip | undefined = this.activeTrip();

    if (activeTrip) {
      void this.tripRepository
        .updateTrip(activeTrip.id, { packedItemIds: [] })
        .catch((error: unknown): void => console.error(error));

      return;
    }

    this.packedItemIdsSignal.set([]);
    this.packingSession.clearPackedItemIds();
  }

  protected isPacked(itemId: string): boolean {
    return this.packedItemIds().includes(itemId);
  }

  protected isSelected(activityId: string): boolean {
    return this.selectedActivityIds().includes(activityId);
  }

  private findActivityByName(name: string, ignoredActivityId?: string): Activity | undefined {
    const normalizedName: string = normalizeName(name);

    return this.activities().find(
      (activity: Activity): boolean =>
        activity.id !== ignoredActivityId && normalizeName(activity.name) === normalizedName,
    );
  }

  private findItemByName(name: string, ignoredItemId?: string): Item | undefined {
    const normalizedName: string = normalizeName(name);

    return this.items().find(
      (item: Item): boolean => item.id !== ignoredItemId && normalizeName(item.name) === normalizedName,
    );
  }

  private openExistingActivityDialog(activity: Activity): void {
    this.dialog
      .open<ActivityDetailsDialogComponent, ActivityDetailsDialogData, ActivityDetailsDialogResult | undefined>(
        ActivityDetailsDialogComponent,
        {
          maxWidth: 'calc(100vw - 1rem)',
          width: '38rem',
          data: {
            activity,
            findDuplicateActivity: (name: string, ignoredActivityId?: string): Activity | undefined =>
              this.findActivityByName(name, ignoredActivityId),
          },
        },
      )
      .afterClosed()
      .subscribe((result: ActivityDetailsDialogResult | undefined): void => {
        if (!result) {
          return;
        }

        if (result.openActivityId) {
          this.openExistingActivityById(result.openActivityId);

          return;
        }

        if (result.input) {
          void this.saveActivity(result.input, result.activityId ?? activity.id).catch((error: unknown): void =>
            console.error(error),
          );
        }
      });
  }

  private openExistingItemDialog(item: Item): void {
    this.dialog
      .open<ItemDetailsDialogComponent, ItemDetailsDialogData, ItemDetailsDialogResult | undefined>(
        ItemDetailsDialogComponent,
        {
          maxWidth: 'calc(100vw - 1rem)',
          width: '38rem',
          data: {
            activities: this.activities(),
            findDuplicateItem: (name: string, ignoredItemId?: string): Item | undefined =>
              this.findItemByName(name, ignoredItemId),
            item,
          },
        },
      )
      .afterClosed()
      .subscribe((result: ItemDetailsDialogResult | undefined): void => {
        if (!result) {
          return;
        }

        if (result.openItemId) {
          this.openExistingItemById(result.openItemId);

          return;
        }

        if (result.input) {
          void this.saveItem(result.input, result.itemId ?? item.id).catch((error: unknown): void =>
            console.error(error),
          );
        }
      });
  }

  private openTripDialog(trip?: Trip): void {
    this.dialog
      .open<TripDetailsDialogComponent, TripDetailsDialogData, TripDetailsDialogResult | undefined>(
        TripDetailsDialogComponent,
        {
          maxWidth: 'calc(100vw - 1rem)',
          width: '38rem',
          data: {
            activityIds: this.selectedActivityIds(),
            packedItemIds: this.packedItemIds(),
            trip,
          },
        },
      )
      .afterClosed()
      .subscribe((result: TripDetailsDialogResult | undefined): void => {
        if (!result) {
          return;
        }

        void this.saveTrip(result.input, trip?.id).catch((error: unknown): void => console.error(error));
      });
  }

  private openExistingActivityById(activityId: string): void {
    const activity: Activity | undefined = this.activities().find(
      (currentActivity: Activity): boolean => currentActivity.id === activityId,
    );

    if (activity) {
      this.openExistingActivityDialog(activity);
    }
  }

  private openExistingItemById(itemId: string): void {
    const item: Item | undefined = this.items().find((currentItem: Item): boolean => currentItem.id === itemId);

    if (item) {
      this.openExistingItemDialog(item);
    }
  }

  private saveActivity(input: CreateActivityInput, activityId?: string): Promise<Activity> {
    if (activityId) {
      return this.activityRepository.updateActivity(activityId, input).then((activity: Activity): Activity => {
        this.selectActivity(activity.id);

        return activity;
      });
    }

    return this.activityRepository.createActivity(input).then((activity: Activity): Activity => {
      this.selectActivity(activity.id);

      return activity;
    });
  }

  private saveItem(input: CreateItemInput, itemId?: string): Promise<Item> {
    return itemId ? this.itemRepository.updateItem(itemId, input) : this.itemRepository.createItem(input);
  }

  private saveTrip(input: CreateTripInput, tripId?: string): Promise<Trip> {
    if (tripId) {
      return this.tripRepository.updateTrip(tripId, input);
    }

    return this.tripRepository.createTrip(input).then((trip: Trip): Trip => {
      this.activeTripIdSignal.set(trip.id);
      this.packingSession.saveActiveTripId(trip.id);

      return trip;
    });
  }

  private selectActivity(activityId: string): void {
    const selectedActivityIds: string[] = this.selectedActivityIds().includes(activityId)
      ? this.selectedActivityIds()
      : [...this.selectedActivityIds(), activityId];
    const activeTrip: Trip | undefined = this.activeTrip();

    if (activeTrip) {
      void this.tripRepository
        .updateTrip(activeTrip.id, { activityIds: selectedActivityIds })
        .catch((error: unknown): void => console.error(error));

      return;
    }

    this.selectedActivityIdsSignal.set(selectedActivityIds);
    this.packingSession.saveSelectedActivityIds(selectedActivityIds);
  }

  private toggleId(ids: string[], id: string): string[] {
    return ids.includes(id) ? ids.filter((currentId: string): boolean => currentId !== id) : [...ids, id];
  }
}

function groupPackingItemsByCategory(items: Item[]): PackingItemCategoryGroup[] {
  const categories: ReadonlyArray<Pick<PackingItemCategoryGroup, 'id' | 'name'>> = [
    ...ITEM_CATEGORIES,
    ...customCategories(items),
    UNCATEGORIZED_CATEGORY,
  ];

  return categories
    .map((category: Pick<PackingItemCategoryGroup, 'id' | 'name'>): PackingItemCategoryGroup => ({
      ...category,
      items: sortPackingItems(items.filter((item: Item): boolean => itemCategoryId(item) === category.id)),
    }))
    .filter((group: PackingItemCategoryGroup): boolean => group.items.length > 0);
}

function itemCategoryId(item: Item): PackingItemCategoryId {
  return item.categoryId ?? UNCATEGORIZED_CATEGORY.id;
}

function customCategories(items: Item[]): Array<Pick<PackingItemCategoryGroup, 'id' | 'name'>> {
  const builtInCategoryIds: Set<string> = new Set(
    ITEM_CATEGORIES.map((category: Pick<PackingItemCategoryGroup, 'id' | 'name'>): string => category.id),
  );
  const categoryIds: string[] = items
    .map((item: Item): string | undefined => item.categoryId)
    .filter((categoryId: string | undefined): categoryId is string => Boolean(categoryId))
    .filter((categoryId: string): boolean => !builtInCategoryIds.has(categoryId));

  return [...new Set(categoryIds)]
    .sort((first: string, second: string): number => first.localeCompare(second))
    .map((categoryId: string): Pick<PackingItemCategoryGroup, 'id' | 'name'> => ({
      id: categoryId,
      name: categoryId,
    }));
}

function sortPackingItems(items: Item[]): Item[] {
  return [...items].sort((first: Item, second: Item): number => first.name.localeCompare(second.name));
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

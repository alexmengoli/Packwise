import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ITEM_CATEGORIES, type Activity, type Item } from '@packwise/shared';
import { ActivityDetailsDialogComponent } from '../../components/activity-details-dialog/activity-details-dialog.component';
import { ItemDetailsDialogComponent } from '../../components/item-details-dialog/item-details-dialog.component';
import { ActivityRepositoryService } from '../../services/activity.repository.service';
import { ItemRepositoryService } from '../../services/item.repository.service';
import type { CreateActivityInput, CreateItemInput } from '../../types/data.types';
import type { PackingItemCategoryGroup, PackingItemCategoryId } from '../../types/packing-item-category.types';

// constants
const UNCATEGORIZED_CATEGORY: Pick<PackingItemCategoryGroup, 'id' | 'name'> = {
  id: 'uncategorized',
  name: 'Uncategorized',
};

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatCardModule, MatCheckboxModule, MatIconModule, MatProgressBarModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage {
  // injections
  private readonly activityRepository = inject(ActivityRepositoryService);
  private readonly dialog = inject(MatDialog);
  private readonly itemRepository = inject(ItemRepositoryService);

  // state
  private readonly selectedActivityIdsSignal = signal<string[]>([]);
  private readonly packedItemIdsSignal = signal<string[]>([]);

  // data
  protected readonly loading = computed(
    (): boolean => this.activityRepository.loading() || this.itemRepository.loading(),
  );
  protected readonly activities = this.activityRepository.activities;
  protected readonly items = this.itemRepository.items;
  protected readonly selectedActivityIds = this.selectedActivityIdsSignal.asReadonly();
  protected readonly hasPackedItems = computed((): boolean => this.packedItemIdsSignal().length > 0);
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
  protected readonly packingItemGroups = computed((): PackingItemCategoryGroup[] =>
    groupPackingItemsByCategory(this.packingItems()),
  );

  protected activityIcon(activity: Activity): string {
    return activity.icon ?? 'hiking';
  }

  protected itemCount(activityId: string): number {
    return this.items().filter((item: Item): boolean => item.mandatory || item.activityIds.includes(activityId)).length;
  }

  protected createActivity(): void {
    this.dialog
      .open<ActivityDetailsDialogComponent, undefined, CreateActivityInput | undefined>(ActivityDetailsDialogComponent, {
        maxWidth: 'calc(100vw - 1rem)',
        width: '38rem',
      })
      .afterClosed()
      .subscribe((input: CreateActivityInput | undefined): void => {
        if (!input) {
          return;
        }

        void this.activityRepository
          .createActivity(input)
          .then((activity: Activity): void => {
            this.selectedActivityIdsSignal.update((selectedActivityIds: string[]): string[] => [
              ...selectedActivityIds,
              activity.id,
            ]);
          })
          .catch((error: unknown): void => console.error(error));
      });
  }

  protected createItem(): void {
    this.dialog
      .open<ItemDetailsDialogComponent, { activities: Activity[]; activityIds: string[] }, CreateItemInput | undefined>(
        ItemDetailsDialogComponent,
        {
          maxWidth: 'calc(100vw - 1rem)',
          width: '38rem',
          data: {
            activities: this.activities(),
            activityIds: this.selectedActivityIds(),
          },
        },
      )
      .afterClosed()
      .subscribe((input: CreateItemInput | undefined): void => {
        if (!input) {
          return;
        }

        void this.itemRepository.createItem(input).catch((error: unknown): void => console.error(error));
      });
  }

  protected toggleActivity(activityId: string): void {
    this.selectedActivityIdsSignal.update((selectedActivityIds: string[]): string[] =>
      selectedActivityIds.includes(activityId)
        ? selectedActivityIds.filter((currentId: string): boolean => currentId !== activityId)
        : [...selectedActivityIds, activityId],
    );
  }

  protected togglePacked(itemId: string): void {
    this.packedItemIdsSignal.update((packedItemIds: string[]): string[] =>
      packedItemIds.includes(itemId)
        ? packedItemIds.filter((currentId: string): boolean => currentId !== itemId)
        : [...packedItemIds, itemId],
    );
  }

  protected clearPackedItems(): void {
    this.packedItemIdsSignal.set([]);
  }

  protected isPacked(itemId: string): boolean {
    return this.packedItemIdsSignal().includes(itemId);
  }

  protected isSelected(activityId: string): boolean {
    return this.selectedActivityIds().includes(activityId);
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

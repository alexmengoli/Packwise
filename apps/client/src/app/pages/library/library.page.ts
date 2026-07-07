import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ITEM_CATEGORIES, type Activity, type Item, type ItemCategoryDefinition } from '@packwise/shared';
import type { Observable } from 'rxjs';
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
import { ActivityRepositoryService } from '../../services/activity.repository.service';
import { ItemRepositoryService } from '../../services/item.repository.service';
import type { CreateActivityInput, CreateItemInput } from '../../types/data.types';

@Component({
  selector: 'app-library-page',
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule],
  templateUrl: './library.page.html',
  styleUrl: './library.page.css',
})
export class LibraryPage {
  // injections
  private readonly activityRepository = inject(ActivityRepositoryService);
  private readonly dialog = inject(MatDialog);
  private readonly itemRepository = inject(ItemRepositoryService);

  // data
  protected readonly loading = computed(
    (): boolean => this.activityRepository.loading() || this.itemRepository.loading(),
  );
  protected readonly activities = this.activityRepository.activities;
  protected readonly expandedActivityLabelId = signal<string | undefined>(undefined);
  protected readonly itemSearch = signal('');
  protected readonly items = this.itemRepository.items;
  protected readonly filteredItems = computed((): Item[] => {
    const searchTerm: string = normalizeSearchTerm(this.itemSearch());

    if (!searchTerm) {
      return this.items();
    }

    return this.items().filter((item: Item): boolean => this.itemMatchesSearch(item, searchTerm));
  });

  protected activityIcon(activity: Activity): string {
    return activity.icon ?? 'hiking';
  }

  protected createActivity(): void {
    this.openActivityDialog();
  }

  protected editActivity(activity: Activity): void {
    this.openActivityDialog(activity);
  }

  protected deleteActivity(activity: Activity): void {
    this.confirmDelete({
      title: 'Delete activity?',
      message: `Delete ${activity.name}? Items assigned to it will stay in your library.`,
    }).subscribe((confirmed: boolean | undefined): void => {
      if (!confirmed) {
        return;
      }

      void this.activityRepository
        .deleteActivity(activity.id)
        .catch((error: unknown): void => console.error(error));
    });
  }

  protected createItem(): void {
    this.openItemDialog();
  }

  protected editItem(item: Item): void {
    this.openItemDialog(item);
  }

  protected deleteItem(item: Item): void {
    this.confirmDelete({
      title: 'Delete item?',
      message: `Delete ${item.name}? It will also be removed from saved trip checklists.`,
    }).subscribe((confirmed: boolean | undefined): void => {
      if (!confirmed) {
        return;
      }

      void this.itemRepository.deleteItem(item.id).catch((error: unknown): void => console.error(error));
    });
  }

  protected updateItemSearch(event: Event): void {
    this.itemSearch.set((event.target as HTMLInputElement).value);
  }

  protected clearItemSearch(): void {
    this.itemSearch.set('');
  }

  protected itemCount(activityId: string): number {
    return this.items().filter(
      (item: Item): boolean => item.mandatory || item.activityIds.includes(activityId),
    ).length;
  }

  protected categoryName(item: Item): string | undefined {
    const category: ItemCategoryDefinition | undefined = ITEM_CATEGORIES.find(
      (currentCategory: ItemCategoryDefinition): boolean => currentCategory.id === item.categoryId,
    );

    return category?.name ?? item.categoryId;
  }

  protected itemActivities(item: Item): Activity[] {
    if (item.mandatory) {
      return this.activities();
    }

    return item.activityIds
      .map((activityId: string): Activity | undefined =>
        this.activities().find((activity: Activity): boolean => activity.id === activityId),
      )
      .filter((activity: Activity | undefined): activity is Activity => Boolean(activity));
  }

  protected isUnassigned(item: Item): boolean {
    return !item.mandatory && this.itemActivities(item).length === 0;
  }

  protected isActivityLabelExpanded(item: Item, activity: Activity): boolean {
    return this.expandedActivityLabelId() === this.activityLabelKey(item, activity);
  }

  protected toggleActivityLabel(item: Item, activity: Activity): void {
    const labelId: string = this.activityLabelKey(item, activity);

    this.expandedActivityLabelId.update(
      (currentLabelId: string | undefined): string | undefined =>
        currentLabelId === labelId ? undefined : labelId,
    );
  }

  private openActivityDialog(activity?: Activity): void {
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
          this.openActivityById(result.openActivityId);

          return;
        }

        if (result.input) {
          void this.saveActivity(result.input, result.activityId ?? activity?.id).catch((error: unknown): void =>
            console.error(error),
          );
        }
      });
  }

  private openItemDialog(item?: Item): void {
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
          this.openItemById(result.openItemId);

          return;
        }

        if (result.input) {
          void this.saveItem(result.input, result.itemId ?? item?.id).catch((error: unknown): void =>
            console.error(error),
          );
        }
      });
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

  private openActivityById(activityId: string): void {
    const activity: Activity | undefined = this.activities().find(
      (currentActivity: Activity): boolean => currentActivity.id === activityId,
    );

    if (activity) {
      this.openActivityDialog(activity);
    }
  }

  private openItemById(itemId: string): void {
    const item: Item | undefined = this.items().find((currentItem: Item): boolean => currentItem.id === itemId);

    if (item) {
      this.openItemDialog(item);
    }
  }

  private saveActivity(input: CreateActivityInput, activityId?: string): Promise<Activity> {
    return activityId
      ? this.activityRepository.updateActivity(activityId, input)
      : this.activityRepository.createActivity(input);
  }

  private saveItem(input: CreateItemInput, itemId?: string): Promise<Item> {
    return itemId ? this.itemRepository.updateItem(itemId, input) : this.itemRepository.createItem(input);
  }

  private confirmDelete(data: ConfirmationDialogData): Observable<boolean | undefined> {
    return this.dialog
      .open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(ConfirmationDialogComponent, {
        data,
        maxWidth: 'calc(100vw - 2rem)',
        width: '24rem',
      })
      .afterClosed();
  }

  private activityLabelKey(item: Item, activity: Activity): string {
    return `${item.id}:${activity.id}`;
  }

  private itemMatchesSearch(item: Item, searchTerm: string): boolean {
    const fields: string[] = [
      item.name,
      item.notes ?? '',
      item.categoryId ?? '',
      this.categoryName(item) ?? '',
    ];

    return fields.some((field: string): boolean => normalizeSearchTerm(field).includes(searchTerm));
  }
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase();
}

function normalizeSearchTerm(value: string): string {
  return value.trim().toLocaleLowerCase();
}

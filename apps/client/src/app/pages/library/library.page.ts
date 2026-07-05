import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ITEM_CATEGORIES, type Activity, type Item, type ItemCategoryDefinition } from '@packwise/shared';
import type { Observable } from 'rxjs';
import { ActivityDetailsDialogComponent } from '../../components/activity-details-dialog/activity-details-dialog.component';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import type { ConfirmationDialogData } from '../../components/confirmation-dialog/confirmation-dialog.types';
import { ItemDetailsDialogComponent } from '../../components/item-details-dialog/item-details-dialog.component';
import { ActivityRepositoryService } from '../../services/activity.repository.service';
import { ItemRepositoryService } from '../../services/item.repository.service';
import type { CreateActivityInput, CreateItemInput } from '../../types/data.types';

@Component({
  selector: 'app-library-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
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
  protected readonly items = this.itemRepository.items;

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
      message: `Delete ${item.name} from your library?`,
    }).subscribe((confirmed: boolean | undefined): void => {
      if (!confirmed) {
        return;
      }

      void this.itemRepository.deleteItem(item.id).catch((error: unknown): void => console.error(error));
    });
  }

  protected itemCount(activityId: string): number {
    return this.items().filter(
      (item: Item): boolean => item.mandatory || item.activityIds.includes(activityId),
    ).length;
  }

  protected categoryName(item: Item): string {
    const category: ItemCategoryDefinition | undefined = ITEM_CATEGORIES.find(
      (currentCategory: ItemCategoryDefinition): boolean => currentCategory.id === item.categoryId,
    );

    return category?.name ?? item.categoryId ?? 'Uncategorized';
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
      .open<ActivityDetailsDialogComponent, { activity?: Activity }, CreateActivityInput | undefined>(
        ActivityDetailsDialogComponent,
        {
          maxWidth: 'calc(100vw - 1rem)',
          width: '38rem',
          data: {
            activity,
          },
        },
      )
      .afterClosed()
      .subscribe((input: CreateActivityInput | undefined): void => {
        if (!input) {
          return;
        }

        const operation: Promise<Activity> = activity
          ? this.activityRepository.updateActivity(activity.id, input)
          : this.activityRepository.createActivity(input);

        void operation.catch((error: unknown): void => console.error(error));
      });
  }

  private openItemDialog(item?: Item): void {
    this.dialog
      .open<ItemDetailsDialogComponent, { activities: Activity[]; item?: Item }, CreateItemInput | undefined>(
        ItemDetailsDialogComponent,
        {
          maxWidth: 'calc(100vw - 1rem)',
          width: '38rem',
          data: {
            activities: this.activities(),
            item,
          },
        },
      )
      .afterClosed()
      .subscribe((input: CreateItemInput | undefined): void => {
        if (!input) {
          return;
        }

        const operation: Promise<Item> = item
          ? this.itemRepository.updateItem(item.id, input)
          : this.itemRepository.createItem(input);

        void operation.catch((error: unknown): void => console.error(error));
      });
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
}

import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { Activity, Item } from '@packwise/shared';

import { ActivityRepositoryService } from '../../services/activity.repository.service';
import { ItemRepositoryService } from '../../services/item.repository.service';
import { STARTER_ACTIVITIES, STARTER_ITEMS } from './home.data';

@Component({
  selector: 'app-home-page',
  imports: [MatCardModule, MatCheckboxModule, MatIconModule, MatProgressBarModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage {
  // injections
  private readonly activityRepository = inject(ActivityRepositoryService);
  private readonly itemRepository = inject(ItemRepositoryService);

  // state
  private readonly selectedActivityIdsSignal = signal<string[]>([STARTER_ACTIVITIES[0].id]);
  private readonly packedItemIdsSignal = signal<string[]>([]);

  // data
  protected readonly loading = computed(
    (): boolean => this.activityRepository.loading() || this.itemRepository.loading(),
  );
  protected readonly activities = computed((): Activity[] => {
    const activities: Activity[] = this.activityRepository.activities();

    return activities.length > 0 ? activities : STARTER_ACTIVITIES;
  });
  protected readonly items = computed((): Item[] => {
    const items: Item[] = this.itemRepository.items();

    return items.length > 0 ? items : STARTER_ITEMS;
  });
  protected readonly selectedActivityIds = this.selectedActivityIdsSignal.asReadonly();
  protected readonly packingItems = computed((): Item[] => {
    const selectedActivityIds: string[] = this.selectedActivityIds();

    if (selectedActivityIds.length === 0) {
      return [];
    }

    return this.items().filter((item: Item): boolean =>
      item.activityIds.some((activityId: string): boolean =>
        selectedActivityIds.includes(activityId),
      ),
    );
  });

  protected activityIcon(activity: Activity): string {
    return activity.icon ?? 'hiking';
  }

  protected itemCount(activityId: string): number {
    return this.items().filter((item: Item): boolean => item.activityIds.includes(activityId))
      .length;
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

  protected isPacked(itemId: string): boolean {
    return this.packedItemIdsSignal().includes(itemId);
  }

  protected isSelected(activityId: string): boolean {
    return this.selectedActivityIds().includes(activityId);
  }
}

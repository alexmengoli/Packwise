import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import type { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';
import type { ConfirmationDialogData } from '../../components/confirmation-dialog/confirmation-dialog.types';
import { ActivityRepositoryService } from '../../services/activity.repository.service';
import { DataPortabilityService } from '../../services/data-portability.service';
import { ItemRepositoryService } from '../../services/item.repository.service';
import { TripRepositoryService } from '../../services/trip.repository.service';

@Component({
  selector: 'app-settings-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.css',
})
export class SettingsPage {
  // injections
  private readonly activityRepository = inject(ActivityRepositoryService);
  private readonly dataPortability = inject(DataPortabilityService);
  private readonly dialog = inject(MatDialog);
  private readonly itemRepository = inject(ItemRepositoryService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly tripRepository = inject(TripRepositoryService);

  // state
  protected readonly deleting = signal<boolean>(false);
  protected readonly exporting = signal<boolean>(false);
  protected readonly importing = signal<boolean>(false);

  // data
  protected readonly busy = computed(
    (): boolean => this.deleting() || this.exporting() || this.importing(),
  );
  protected readonly hasLocalData = computed(
    (): boolean =>
      this.activityRepository.activities().length > 0 ||
      this.itemRepository.items().length > 0 ||
      this.tripRepository.trips().length > 0,
  );

  protected exportData(): void {
    if (!this.hasLocalData()) {
      return;
    }

    this.exporting.set(true);

    void this.dataPortability
      .createExportJson()
      .then((json: string): void => {
        this.downloadJson(json);
        this.showFeedback('Your local Packwise data was exported.');
      })
      .catch((error: unknown): void => this.handleError(error, 'Could not export your data.'))
      .finally((): void => this.exporting.set(false));
  }

  protected importData(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const file: File | undefined = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    this.confirmImport().subscribe((confirmed: boolean | undefined): void => {
      if (!confirmed) {
        return;
      }

      this.importing.set(true);

      void file
        .text()
        .then((json: string): Promise<void> => this.dataPortability.importJson(json))
        .then((): Promise<void[]> =>
          Promise.all([
            this.activityRepository.refresh(),
            this.itemRepository.refresh(),
            this.tripRepository.refresh(),
          ]),
        )
        .then((): void => this.showFeedback('Your local Packwise data was imported.'))
        .catch((error: unknown): void => this.handleError(error, 'Could not import that JSON file.'))
        .finally((): void => this.importing.set(false));
    });
  }

  protected deleteAllData(): void {
    if (!this.hasLocalData()) {
      return;
    }

    const data: ConfirmationDialogData = {
      title: 'Delete all local data?',
      message: 'This removes every Packwise activity, item, and saved trip on this device. This cannot be undone.',
      confirmLabel: 'Delete all',
      confirmTone: 'danger',
    };

    this.dialog
      .open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(ConfirmationDialogComponent, {
        data,
        maxWidth: 'calc(100vw - 2rem)',
        width: '24rem',
      })
      .afterClosed()
      .subscribe((confirmed: boolean | undefined): void => {
        if (!confirmed) {
          return;
        }

        this.deleting.set(true);

        void this.dataPortability
          .deleteAllData()
          .then((): Promise<void[]> =>
            Promise.all([
              this.activityRepository.refresh(),
              this.itemRepository.refresh(),
              this.tripRepository.refresh(),
            ]),
          )
          .then((): void => this.showFeedback('All local Packwise data was deleted.'))
          .catch((error: unknown): void => this.handleError(error, 'Could not delete your data.'))
          .finally((): void => this.deleting.set(false));
      });
  }

  private downloadJson(json: string): void {
    const blob: Blob = new Blob([json], { type: 'application/json' });
    const url: string = URL.createObjectURL(blob);
    const link: HTMLAnchorElement = document.createElement('a');

    link.href = url;
    link.download = `packwise-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private handleError(error: unknown, fallbackMessage: string): void {
    console.error(error);
    this.showFeedback(error instanceof Error ? error.message : fallbackMessage);
  }

  private confirmImport(): Observable<boolean | undefined> {
    const data: ConfirmationDialogData = {
      title: 'Import data?',
      message: 'Import this file and replace your current local Packwise data?',
      confirmLabel: 'Import',
      confirmTone: 'primary',
    };

    return this.dialog
      .open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(ConfirmationDialogComponent, {
        data,
        maxWidth: 'calc(100vw - 2rem)',
        width: '24rem',
      })
      .afterClosed();
  }

  private showFeedback(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 6000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}

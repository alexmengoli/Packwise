import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import type { Activity } from '@packwise/shared';
import { DuplicateNameSnackbarService } from '../../services/duplicate-name-snackbar.service';
import type { CreateActivityInput } from '../../types/data.types';
import type { ActivityDetailsDialogData, ActivityDetailsDialogResult } from './activity-details-dialog.types';

// constants
const DEFAULT_ACTIVITY_ICON = 'hiking';
const DEFAULT_ACTIVITY_HUE = 180;
const ACTIVITY_COLOR_SATURATION = 88;
const ACTIVITY_COLOR_LIGHTNESS = 31;
const ACTIVITY_ICONS: readonly string[] = [
  'hiking',
  'beach_access',
  'park',
  'terrain',
  'landscape',
  'kayaking',
  'sailing',
  'pool',
  'surfing',
  'downhill_skiing',
  'snowboarding',
  'directions_run',
  'directions_bike',
  'fitness_center',
  'sports_soccer',
  'sports_basketball',
  'sports_tennis',
  'sports_baseball',
  'sports_golf',
  'sports_esports',
  'flight_takeoff',
  'directions_car',
  'train',
  'hotel',
  'restaurant',
  'local_fire_department',
  'photo_camera',
  'music_note',
  'theater_comedy',
  'palette',
  'celebration',
  'family_restroom',
  'child_care',
  'medical_services',
  'volunteer_activism',
  'work',
  'business_center',
  'laptop_mac',
  'home_repair_service',
  'construction',
  'school',
  'pets',
];
const ACTIVITY_HUES: readonly number[] = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

@Component({
  selector: 'app-activity-details-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './activity-details-dialog.component.html',
  styleUrl: './activity-details-dialog.component.css',
})
export class ActivityDetailsDialogComponent {
  // injections
  private readonly data = inject<ActivityDetailsDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject<
    MatDialogRef<ActivityDetailsDialogComponent, ActivityDetailsDialogResult | undefined>
  >(MatDialogRef);
  private readonly duplicateNameSnackbar = inject(DuplicateNameSnackbarService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  // data
  protected readonly activityIcons: readonly string[] = ACTIVITY_ICONS;
  protected readonly activityHues: readonly number[] = ACTIVITY_HUES;
  protected readonly isEditing: boolean = Boolean(this.data?.activity);
  protected readonly initialHue: number = hueFromActivityColor(this.data?.activity?.color);
  protected readonly form = this.formBuilder.group({
    name: [this.data?.activity?.name ?? '', [Validators.required]],
    notes: [this.data?.activity?.notes ?? ''],
    icon: [this.data?.activity?.icon ?? DEFAULT_ACTIVITY_ICON],
    hue: [this.initialHue],
  });

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected hslColor(hue: number): string {
    return hslColor(hue);
  }

  protected selectIcon(icon: string): void {
    this.form.controls.icon.setValue(icon);
  }

  protected selectHue(hue: number): void {
    this.form.controls.hue.setValue(hue);
  }

  protected updateHue(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;

    this.selectHue(input.valueAsNumber);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();
    const input: CreateActivityInput = {
      name: value.name.trim(),
      notes: optionalTrim(value.notes),
      icon: optionalTrim(value.icon),
      color: hslColor(value.hue),
    };
    const duplicateActivity: Activity | undefined = this.data?.findDuplicateActivity?.(
      input.name,
      this.data.activity?.id,
    );

    if (duplicateActivity) {
      this.duplicateNameSnackbar.open('activity', duplicateActivity.name).subscribe((action): void => {
        if (action === 'overwrite') {
          this.dialogRef.close({
            activityId: duplicateActivity.id,
            input,
          });

          return;
        }

        this.dialogRef.close({
          openActivityId: duplicateActivity.id,
        });
      });

      return;
    }

    this.dialogRef.close({ input });
  }
}

function hslColor(hue: number): string {
  return `hsl(${normalizeHue(hue)} ${ACTIVITY_COLOR_SATURATION}% ${ACTIVITY_COLOR_LIGHTNESS}%)`;
}

function hueFromActivityColor(color: string | undefined): number {
  if (!color) {
    return DEFAULT_ACTIVITY_HUE;
  }

  const hslMatch: RegExpMatchArray | null = color.match(/hsl\(\s*(\d+(?:\.\d+)?)/i);

  if (hslMatch) {
    return normalizeHue(Number(hslMatch[1]));
  }

  const hexHue: number | undefined = hueFromHexColor(color);

  return hexHue ?? DEFAULT_ACTIVITY_HUE;
}

function hueFromHexColor(color: string): number | undefined {
  const hexMatch: RegExpMatchArray | null = color.match(/^#?([0-9a-f]{6})$/i);

  if (!hexMatch) {
    return undefined;
  }

  const hex: string = hexMatch[1];
  const red: number = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const green: number = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const blue: number = Number.parseInt(hex.slice(4, 6), 16) / 255;
  const max: number = Math.max(red, green, blue);
  const min: number = Math.min(red, green, blue);
  const delta: number = max - min;

  if (delta === 0) {
    return DEFAULT_ACTIVITY_HUE;
  }

  if (max === red) {
    return normalizeHue(60 * (((green - blue) / delta) % 6));
  }

  if (max === green) {
    return normalizeHue(60 * ((blue - red) / delta + 2));
  }

  return normalizeHue(60 * ((red - green) / delta + 4));
}

function normalizeHue(hue: number): number {
  return Math.round(((hue % 360) + 360) % 360);
}

function optionalTrim(value: string): string | undefined {
  const trimmedValue: string = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

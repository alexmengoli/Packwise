import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import type { CreateActivityInput } from '../../types/data.types';
import type { ActivityDetailsDialogData } from './activity-details-dialog.types';

// constants
const DEFAULT_ACTIVITY_ICON = 'hiking';
const DEFAULT_ACTIVITY_HUE = 188;
const ACTIVITY_COLOR_SATURATION = 88;
const ACTIVITY_COLOR_LIGHTNESS = 31;
const ACTIVITY_ICONS: readonly string[] = [
  'hiking',
  'beach_access',
  'directions_bike',
  'fitness_center',
  'flight_takeoff',
  'work',
  'school',
  'pets',
];
const ACTIVITY_HUES: readonly number[] = [188, 181, 39, 145, 216, 274, 12, 327];

@Component({
  selector: 'app-activity-details-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './activity-details-dialog.component.html',
  styleUrl: './activity-details-dialog.component.css',
})
export class ActivityDetailsDialogComponent {
  // injections
  private readonly data = inject<ActivityDetailsDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject<
    MatDialogRef<ActivityDetailsDialogComponent, CreateActivityInput | undefined>
  >(MatDialogRef);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  // data
  protected readonly activityIcons: readonly string[] = ACTIVITY_ICONS;
  protected readonly activityHues: readonly number[] = ACTIVITY_HUES;
  protected readonly isEditing: boolean = Boolean(this.data?.activity);
  protected readonly initialHue: number = hueFromActivityColor(this.data?.activity?.color);
  protected readonly form = this.formBuilder.group({
    name: [this.data?.activity?.name ?? '', [Validators.required]],
    description: [this.data?.activity?.description ?? ''],
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
      description: optionalTrim(value.description),
      icon: optionalTrim(value.icon),
      color: hslColor(value.hue),
    };

    this.dialogRef.close(input);
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

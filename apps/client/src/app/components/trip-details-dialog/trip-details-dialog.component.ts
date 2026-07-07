import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import type { CreateTripInput } from '../../types/data.types';
import type { TripDetailsDialogData, TripDetailsDialogResult } from './trip-details-dialog.types';

@Component({
  selector: 'app-trip-details-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './trip-details-dialog.component.html',
  styleUrl: './trip-details-dialog.component.css',
})
export class TripDetailsDialogComponent {
  // injections
  private readonly data = inject<TripDetailsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<TripDetailsDialogComponent, TripDetailsDialogResult | undefined>>(
    MatDialogRef,
  );
  private readonly formBuilder = inject(NonNullableFormBuilder);

  // data
  protected readonly isEditing: boolean = Boolean(this.data.trip);
  protected readonly form = this.formBuilder.group({
    name: [this.data.trip?.name ?? '', [Validators.required]],
    notes: [this.data.trip?.notes ?? ''],
  });

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();
    const input: CreateTripInput = {
      name: value.name.trim(),
      notes: optionalTrim(value.notes),
      activityIds: this.data.trip?.activityIds ?? this.data.activityIds,
      packedItemIds: this.data.trip?.packedItemIds ?? this.data.packedItemIds,
    };

    this.dialogRef.close({ input });
  }
}

function optionalTrim(value: string): string | undefined {
  const trimmedValue: string = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

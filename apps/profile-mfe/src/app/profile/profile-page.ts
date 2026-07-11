import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { DdsButton, DdsCard } from '@dds/ui';
import { CreateProfileRequest, StepUpdateRequest } from '../models/profile.models';
import { ProfileContextService } from '../services/profile-context.service';
import { ProfileStore } from '../services/profile-store';
import { ProfileEdit } from './edit/profile-edit';
import { ProfileOverview } from './overview/profile-overview';

@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DdsButton, DdsCard, ProfileOverview, ProfileEdit],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage {
  private readonly context = inject(ProfileContextService);
  protected readonly store = inject(ProfileStore);

  protected readonly editing = signal(false);
  private readonly pendingCreate = signal(false);

  constructor() {
    // (Re)load whenever the active company changes (Phase 5 switcher drives this).
    effect(() => {
      const rc = this.context.registryCode();
      untracked(() => {
        this.editing.set(false);
        this.store.load(rc);
      });
    });

    // Leave the create flow once the profile has been created.
    effect(() => {
      if (this.store.status() === 'loaded' && untracked(() => this.pendingCreate())) {
        this.pendingCreate.set(false);
        this.editing.set(false);
      }
    });

    // Auto-dismiss the save toast.
    effect((onCleanup) => {
      if (this.store.toast()) {
        const t = setTimeout(() => this.store.clearToast(), 3500);
        onCleanup(() => clearTimeout(t));
      }
    });
  }

  protected startCreate(): void {
    this.editing.set(true);
  }
  protected onEdit(): void {
    this.editing.set(true);
  }
  protected onCancel(): void {
    this.editing.set(false);
  }
  protected onRefresh(): void {
    this.store.refresh(this.context.registryCode());
  }
  protected onSaveStep(e: { step: number; body: StepUpdateRequest }): void {
    this.store.updateStep(this.context.registryCode(), e.step, e.body);
  }
  protected onCreate(req: CreateProfileRequest): void {
    this.pendingCreate.set(true);
    this.store.create(req);
  }
}

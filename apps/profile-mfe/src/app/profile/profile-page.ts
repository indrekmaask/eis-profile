import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DdsButton, DdsCard } from '@dds/ui';
import { CreateProfileRequest } from '../models/profile.models';
import { DEFAULT_REGISTRY_CODE, ProfileContextService } from '../services/profile-context.service';
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
  protected readonly editStep = signal<number | null>(null);
  private readonly pendingCreate = signal(false);
  /** Set from ?create=1 (e.g. the "Koosta profiil" link on Minu teenused) → open the form directly. */
  private readonly autoCreate = signal(false);

  constructor() {
    // Apply the active company/person from the URL on load and on every shell
    // navigation (the mock switcher / "Vali roll" navigates to /profiil?rc=…&person=…).
    this.applyFromUrl();
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.applyFromUrl());

    effect(() => {
      if (this.store.status() === 'loaded' && untracked(() => this.pendingCreate())) {
        this.pendingCreate.set(false);
        this.editing.set(false);
      }
    });

    // ?create=1 → jump straight to the create form once the (empty) profile has loaded.
    effect(() => {
      if (this.store.status() === 'empty' && this.autoCreate()) {
        this.autoCreate.set(false);
        this.editing.set(true);
      }
    });

    effect((onCleanup) => {
      if (this.store.toast()) {
        const t = setTimeout(() => this.store.clearToast(), 3500);
        onCleanup(() => clearTimeout(t));
      }
    });
  }

  private applyFromUrl(): void {
    const params = new URLSearchParams(window.location.search);
    // || (not ??): URLSearchParams.get returns '' for a present-but-empty ?rc=
    const rc = params.get('rc') || DEFAULT_REGISTRY_CODE;
    const person = params.get('person');
    if (person) {
      this.context.setPerson(person);
    }
    if (params.get('create') === '1') {
      this.autoCreate.set(true);
    }
    if (rc !== this.context.registryCode() || this.store.status() === 'idle') {
      this.context.setCompany(rc);
      this.editing.set(false);
      this.editStep.set(null);
      this.store.load(rc);
    }
  }

  protected startCreate(): void {
    this.editing.set(true);
  }
  protected onCancel(): void {
    this.editing.set(false);
  }
  protected onRefresh(): void {
    this.store.refresh(this.context.registryCode());
  }
  protected onEditRequested(step: number): void {
    this.editStep.set(step);
  }
  protected onEditSaved(): void {
    this.editStep.set(null);
    this.store.load(this.context.registryCode());
  }
  protected onCreate(req: CreateProfileRequest): void {
    this.pendingCreate.set(true);
    this.store.create(req);
  }
}

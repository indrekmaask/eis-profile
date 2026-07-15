import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AccessEntry,
  CreateProfileRequest,
  PrefillView,
  ProfileView,
  SnapshotSummary,
  SnapshotType,
  StepUpdateRequest,
} from './models';

/** Thin HTTP client for the BLL. Same-origin base `/api` (nginx proxies to the backend). */
@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  getProfile(registryCode: string): Observable<ProfileView> {
    return this.http.get<ProfileView>(`${this.base}/profiles/${registryCode}`);
  }

  prefill(registryCode: string): Observable<PrefillView> {
    return this.http.get<PrefillView>(`${this.base}/profiles/${registryCode}/prefill`);
  }

  create(request: CreateProfileRequest): Observable<ProfileView> {
    return this.http.post<ProfileView>(`${this.base}/profiles`, request);
  }

  updateStep(registryCode: string, step: number, body: StepUpdateRequest): Observable<ProfileView> {
    return this.http.patch<ProfileView>(`${this.base}/profiles/${registryCode}/step/${step}`, body);
  }

  refresh(registryCode: string): Observable<ProfileView> {
    return this.http.post<ProfileView>(`${this.base}/profiles/${registryCode}/refresh`, {});
  }

  listAccess(personCode: string): Observable<AccessEntry[]> {
    return this.http.get<AccessEntry[]>(`${this.base}/access`, { params: { personCode } });
  }

  captureSnapshot(registryCode: string, type: SnapshotType): Observable<SnapshotSummary> {
    return this.http.post<SnapshotSummary>(
      `${this.base}/profiles/${registryCode}/snapshots`,
      {},
      { params: { type } },
    );
  }

  listSnapshots(registryCode: string): Observable<SnapshotSummary[]> {
    return this.http.get<SnapshotSummary[]>(`${this.base}/profiles/${registryCode}/snapshots`);
  }

  getSnapshot(registryCode: string, snapshotId: string): Observable<ProfileView> {
    return this.http.get<ProfileView>(
      `${this.base}/profiles/${registryCode}/snapshots/${snapshotId}`,
    );
  }

  /** Demo helper: wipe + re-seed the profile schema to its canonical Biomarket state. */
  reseed(): Observable<{ status: string; migrationsApplied: number }> {
    return this.http.post<{ status: string; migrationsApplied: number }>(
      `${this.base}/admin/reseed`,
      {},
    );
  }
}

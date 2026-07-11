import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AccessEntry,
  CreateProfileRequest,
  PrefillView,
  ProfileView,
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
}

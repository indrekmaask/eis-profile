import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ProfileContextService } from './profile-context.service';

export const actorInterceptor: HttpInterceptorFn = (req, next) => {
  const person = inject(ProfileContextService).personCode();
  if (person && req.url.startsWith('/api')) {
    return next(req.clone({ setHeaders: { 'X-Actor-Person': person } }));
  }
  return next(req);
};

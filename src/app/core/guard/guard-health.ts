import {CanActivateFn} from '@angular/router';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HealthResponse} from '../../../types/health.type';
import {environment} from '../../../environments/environment';
import {catchError, map} from 'rxjs/operators';
import {of} from 'rxjs';


export const guardHealth: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  return http.get<HealthResponse>(environment.apiUrl + '/health').pipe(
    map((response: HealthResponse) => response.status === 'healthy'),
    catchError((error) => {
      console.log(error);
      return of(false);
    })
  );

};

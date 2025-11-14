import { CanActivateFn } from '@angular/router';

export const forwardGuard: CanActivateFn = (route, state) => {
  return true;
};

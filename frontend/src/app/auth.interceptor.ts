import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  if (req.url.includes('/api/auth/')) {
    console.log(' Skipping auth for authentication URL');
    return next(req);
  }

  const token = localStorage.getItem('authToken');
  console.log(' Token from localStorage:', token ? `PRESENT (${token.length} chars)` : 'NULL');

  if (token) {
    console.log(' Adding Authorization header');

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  return next(req);
};

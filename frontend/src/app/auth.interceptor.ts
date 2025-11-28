import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  console.log('🔐 ===== INTERCEPTOR START =====');
  console.log('🔐 Interceptor - URL:', req.url);
  console.log('🔐 Interceptor - Method:', req.method);
  console.log('🔐 Interceptor - Headers before:', req.headers.keys());

  // Skip auth for authentication URLs
  if (req.url.includes('/api/auth/')) {
    console.log('🔐 Skipping auth for authentication URL');
    return next(req);
  }

  const token = localStorage.getItem('authToken');
  console.log('🔐 Token from localStorage:', token ? `PRESENT (${token.substring(0, 20)}...)` : 'NULL');

  if (token) {
    console.log('🔐 Adding Authorization header to:', req.url);

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('🔐 Headers after:', authReq.headers.keys());
    console.log('🔐 Authorization header:', authReq.headers.get('Authorization')?.substring(0, 30) + '...');
    console.log('🔐 ===== INTERCEPTOR END =====');

    return next(authReq).pipe(
      tap(event => {
        if (event.type === 0) { // Sent
          console.log('✅ Request sent with auth header to:', req.url);
        }
      })
    );
  }

  console.warn('⚠️ No token found for request to:', req.url);
  console.log('🔐 ===== INTERCEPTOR END =====');
  return next(req);
};

// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  
  console.log('🔄 AuthInterceptor for:', req.url);
  
  // Ne pas ajouter le header pour les URLs d'authentification
  if (req.url.includes('/api/auth/')) {
    console.log('🚫 Skipping auth for authentication URL');
    return next(req);
  }

  const token = localStorage.getItem('authToken');
  
  if (token) {
    console.log('✅ Adding Authorization header');
    
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    return next(authReq);
  }
  
  console.log('❌ No token found for protected route');
  return next(req);
};
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  
  console.log('=== 🚨 AUTH INTERCEPTOR TRIGGERED 🚨 ===');
  console.log('🔄 URL:', req.url);
  console.log('🔍 Method:', req.method);
  console.log('📨 Original Headers:', req.headers.keys());
  
  // Ne pas ajouter le header pour les URLs d'authentification
  if (req.url.includes('/api/auth/')) {
    console.log('🚫 Skipping auth for authentication URL');
    return next(req);
  }

  const token = localStorage.getItem('authToken');
  console.log('🔐 Token from localStorage:', token ? `PRESENT (${token.length} chars)` : 'NULL');
  
  if (token) {
    console.log('✅ Adding Authorization header');
    
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('📨 Final Headers:', authReq.headers.keys());
    console.log('🔑 Authorization Header:', authReq.headers.get('Authorization')?.substring(0, 50) + '...');
    console.log('=== ✅ INTERCEPTOR COMPLETE ===');
    
    return next(authReq);
  }
  
  console.log('❌ No token - proceeding without auth');
  console.log('=== ❌ INTERCEPTOR COMPLETE ===');
  return next(req);
};
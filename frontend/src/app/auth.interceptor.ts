// src/app/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔄 INTERCEPTOR TRIGGERED for URL:', req.url);

  // Exclure les URLs de photos de l'authentification
  if (req.url.includes('/photo')) {
    console.log('📸 Photo URL detected - skipping auth header');
    return next(req);
  }

  const token = localStorage.getItem('authToken');

  console.log('🔐 Token from localStorage:', token ? 'PRESENT' : 'NULL');

  if (token) {
    console.log('✅ Adding Authorization header with Bearer token');

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  console.log('❌ No token found, proceeding without auth');
  return next(req);
};

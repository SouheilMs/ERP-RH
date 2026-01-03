import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


// Routes
import { routes } from './app.routes';

// Interceptor
import { authInterceptor } from './auth.interceptor';
import {ChatbotComponent} from './components/chatbot/chatbot';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    ChatbotComponent


  ],
  providers: [

  ],
  bootstrap: [] // Pas de bootstrap ici car AppComponent est standalone
})
export class AppModule { }

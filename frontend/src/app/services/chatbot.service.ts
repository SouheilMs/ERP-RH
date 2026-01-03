import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuickAction {
  label: string;
  icon: string;
  action: () => void;
}

export interface ChatbotResponse {
  answer: string;
  confidence: number;
  quickActions?: QuickAction[];
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8081/api/chatbot'; // Remplacez par votre URL backend

  constructor(private http: HttpClient) {}

  askQuestion(question: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/ask`, { question });
  }

  getFAQ(): Observable<FAQItem[]> {
    return this.http.get<FAQItem[]>(`${this.apiUrl}/faq`);
  }
}

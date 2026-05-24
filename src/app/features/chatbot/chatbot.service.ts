import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

export interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  history?: { role: string; content: string }[];
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  success?: boolean;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly sessionId: string;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.sessionId = crypto.randomUUID();
  }

  get messages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  sendMessage(text: string): Observable<ChatResponse> {
    const endpoint = this.authService.isAuthenticated()
      ? `${environment.apiUrl}/Chatbot/chat`
      : `${environment.apiUrl}/Chatbot/chat/anonymous`;

    const history = this.messagesSubject.value.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }));

    const body: ChatRequest = {
      message: text,
      sessionId: this.sessionId,
      history: history.length > 0 ? history : undefined
    };

    this.addMessage(text, true);

    return this.http.post<ChatResponse>(endpoint, body).pipe(
      tap(res => this.addMessage(res.response, false))
    );
  }

  clearHistory(): void {
    this.messagesSubject.next([]);
  }

  addBotMessage(text: string): void {
    this.addMessage(text, false);
  }

  private addMessage(text: string, isUser: boolean): void {
    const msg: ChatMessage = { id: Date.now(), text, isUser, timestamp: new Date() };
    this.messagesSubject.next([...this.messagesSubject.value, msg]);
  }
}

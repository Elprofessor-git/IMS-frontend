import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';

import { ChatbotService, ChatMessage } from './chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="chatbot-container">
      <mat-card class="chatbot-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>smart_toy</mat-icon>
            Assistant IA — Gestion Textile
          </mat-card-title>
          <mat-card-subtitle>
            Posez vos questions en français, arabe ou anglais
          </mat-card-subtitle>
          <div class="header-actions">
            <button mat-icon-button (click)="effacerHistorique()" matTooltip="Effacer l'historique">
              <mat-icon>delete_sweep</mat-icon>
            </button>
          </div>
        </mat-card-header>

        <mat-card-content class="chat-content">
          <div class="chat-messages" #chatContainer>

            <div *ngIf="messages.length === 0" class="welcome-message">
              <mat-icon>smart_toy</mat-icon>
              <p>Bonjour ! Je suis votre assistant IA pour la gestion textile.<br>
              Comment puis-je vous aider ?</p>
            </div>

            <div *ngFor="let msg of messages"
                 class="message"
                 [class.user-message]="msg.isUser"
                 [class.bot-message]="!msg.isUser">
              <div class="bubble">
                <div class="bubble-header">
                  <mat-icon>{{ msg.isUser ? 'person' : 'smart_toy' }}</mat-icon>
                  <span>{{ msg.isUser ? 'Vous' : 'Assistant IA' }}</span>
                  <span class="timestamp">{{ msg.timestamp | date:'HH:mm' }}</span>
                </div>
                <div class="bubble-text">{{ msg.text }}</div>
              </div>
            </div>

            <!-- Indicateur chargement -->
            <div *ngIf="isLoading" class="message bot-message">
              <div class="bubble loading-bubble">
                <div class="bubble-header">
                  <mat-icon>smart_toy</mat-icon>
                  <span>Assistant IA</span>
                </div>
                <div class="loading-dots">
                  <mat-spinner diameter="16"></mat-spinner>
                  <span>IA en cours...</span>
                </div>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="chat-input">
            <mat-form-field appearance="outline" class="input-field">
              <mat-label>Votre message...</mat-label>
              <input matInput
                     [(ngModel)]="newMessage"
                     (keyup.enter)="envoyer()"
                     [disabled]="isLoading"
                     placeholder="Ex: Quel est le stock actuel en tissu coton ?">
            </mat-form-field>
            <button mat-raised-button color="primary"
                    (click)="envoyer()"
                    [disabled]="!newMessage.trim() || isLoading">
              <mat-icon>send</mat-icon>
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Suggestions -->
      <mat-card class="suggestions-card">
        <mat-card-header>
          <mat-card-title>Suggestions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="suggestions-list">
            <button *ngFor="let s of suggestions"
                    mat-stroked-button
                    class="suggestion-btn"
                    (click)="utiliserSuggestion(s)">
              <mat-icon>lightbulb</mat-icon>
              {{ s }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .chatbot-container { display: flex; gap: 20px; padding: 20px; height: calc(100vh - 120px); }

    .chatbot-card { flex: 2; display: flex; flex-direction: column; overflow: hidden; }
    mat-card-header { position: relative; }
    mat-card-title { display: flex; align-items: center; gap: 8px; color: #1976d2; }
    .header-actions { position: absolute; right: 0; top: 0; }

    .chat-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 0 16px 16px; }

    .chat-messages { flex: 1; overflow-y: auto; padding: 12px 0; display: flex; flex-direction: column; gap: 12px; min-height: 200px; max-height: calc(100vh - 300px); }

    .welcome-message { text-align: center; padding: 40px 20px; color: #999; }
    .welcome-message mat-icon { font-size: 48px; height: 48px; width: 48px; color: #1976d2; opacity: 0.5; }

    .message { display: flex; }
    .user-message { justify-content: flex-end; }
    .bot-message { justify-content: flex-start; }

    .bubble { max-width: 72%; padding: 10px 14px; border-radius: 16px; }
    .user-message .bubble { background: #1976d2; color: white; border-bottom-right-radius: 4px; }
    .bot-message .bubble { background: #f5f5f5; color: #333; border-bottom-left-radius: 4px; }

    .bubble-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 0.78rem; opacity: 0.75; }
    .bubble-header mat-icon { font-size: 14px; height: 14px; width: 14px; }
    .timestamp { margin-left: auto; font-size: 0.72rem; }
    .bubble-text { line-height: 1.5; white-space: pre-wrap; word-break: break-word; }

    .loading-bubble { background: #f5f5f5; }
    .loading-dots { display: flex; align-items: center; gap: 8px; color: #666; font-style: italic; }

    .chat-input { display: flex; gap: 10px; align-items: center; padding-top: 12px; }
    .input-field { flex: 1; }

    .suggestions-card { flex: 1; max-width: 280px; overflow-y: auto; }
    .suggestions-list { display: flex; flex-direction: column; gap: 8px; }
    .suggestion-btn { text-align: left; justify-content: flex-start; white-space: normal; height: auto; padding: 8px 12px; font-size: 0.82rem; line-height: 1.3; }
    .suggestion-btn mat-icon { font-size: 16px; height: 16px; width: 16px; margin-right: 6px; color: #ff9800; flex-shrink: 0; }

    @media (max-width: 768px) {
      .chatbot-container { flex-direction: column; height: auto; }
      .suggestions-card { max-width: none; }
      .bubble { max-width: 85%; }
    }
  `]
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  private sub!: Subscription;
  private shouldScroll = false;

  suggestions = [
    'Quel est le niveau de stock actuel ?',
    'Quelles commandes sont en cours ?',
    'Liste des achats en attente',
    'Alertes stock faible',
    'Statut des importations',
    'What is the current stock level?',
    'ما هو مستوى المخزون الحالي؟'
  ];

  constructor(private chatService: ChatbotService) {}

  ngOnInit(): void {
    this.sub = this.chatService.messages$.subscribe(msgs => {
      this.messages = msgs;
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  envoyer(): void {
    const text = this.newMessage.trim();
    if (!text || this.isLoading) return;
    this.newMessage = '';
    this.isLoading = true;

    this.chatService.sendMessage(text).subscribe({
      next: () => { this.isLoading = false; },
      error: () => {
        this.isLoading = false;
        this.chatService.addBotMessage('Désolé, une erreur est survenue. Veuillez réessayer.');
      }
    });
  }

  utiliserSuggestion(s: string): void {
    this.newMessage = s;
    this.envoyer();
  }

  effacerHistorique(): void {
    this.chatService.clearHistory();
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}

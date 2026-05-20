import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

import { ChatbotService, ChatMessage } from './chatbot.service';

@Component({
  selector: 'app-chatbot-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <!-- ÉLÉMENT 1 — Bulle ronde toujours visible -->
    <button class="chat-bubble-btn" (click)="toggleChat()" [matTooltip]="isOpen ? 'Fermer' : 'Ouvrir l\\'assistant IA'">
      <mat-icon>{{ isOpen ? 'close' : 'chat' }}</mat-icon>
      <span *ngIf="unreadCount > 0 && !isOpen" class="unread-badge">{{ unreadCount }}</span>
    </button>

    <!-- ÉLÉMENT 2 — Panneau conditionnel -->
    <div class="chat-panel" *ngIf="isOpen">

      <div class="panel-header">
        <mat-icon class="header-icon">smart_toy</mat-icon>
        <span>Assistant IA</span>
        <a routerLink="/chatbot" class="fullscreen-link" matTooltip="Plein écran">
          <mat-icon>open_in_full</mat-icon>
        </a>
      </div>

      <div class="panel-messages" #panelMessages>
        <div *ngIf="messages.length === 0" class="panel-welcome">
          Posez votre question...
        </div>
        <div *ngFor="let msg of messages"
             class="panel-bubble"
             [class.user-bubble]="msg.isUser"
             [class.bot-bubble]="!msg.isUser">
          {{ msg.text }}
        </div>
        <div *ngIf="isLoading" class="panel-bubble bot-bubble loading">
          <mat-spinner diameter="12"></mat-spinner>
          <span>IA en cours...</span>
        </div>
      </div>

      <div class="panel-input">
        <input class="panel-input-field"
               [(ngModel)]="newMessage"
               (keyup.enter)="envoyer()"
               [disabled]="isLoading"
               placeholder="Votre message...">
        <button mat-icon-button color="primary"
                (click)="envoyer()"
                [disabled]="!newMessage.trim() || isLoading">
          <mat-icon>send</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ÉLÉMENT 1 — Bulle ronde */
    .chat-bubble-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #4F46E5;
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(79,70,229,0.5);
      z-index: 1001;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .chat-bubble-btn:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(79,70,229,0.6); }
    .chat-bubble-btn mat-icon { font-size: 24px; height: 24px; width: 24px; }
    .unread-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #f44336;
      color: white;
      border-radius: 10px;
      padding: 1px 5px;
      font-size: 0.68rem;
      font-weight: 700;
      line-height: 1.4;
    }

    /* ÉLÉMENT 2 — Panneau */
    .chat-panel {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 350px;
      height: 480px;
      border-radius: 16px;
      background: white;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Header */
    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #4F46E5;
      color: white;
      font-size: 0.875rem;
      font-weight: 500;
      flex-shrink: 0;
    }
    .header-icon { font-size: 18px; height: 18px; width: 18px; }
    .fullscreen-link {
      margin-left: auto;
      color: white;
      opacity: 0.8;
      display: flex;
      align-items: center;
    }
    .fullscreen-link:hover { opacity: 1; }
    .fullscreen-link mat-icon { font-size: 16px; height: 16px; width: 16px; }

    /* Messages */
    .panel-messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #f8f8fc;
    }
    .panel-welcome { color: #aaa; font-size: 0.8rem; text-align: center; padding: 24px 0; }

    .panel-bubble {
      max-width: 88%;
      padding: 7px 11px;
      border-radius: 14px;
      font-size: 0.82rem;
      line-height: 1.45;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .user-bubble {
      align-self: flex-end;
      background: #4F46E5;
      color: white;
      border-bottom-right-radius: 3px;
    }
    .bot-bubble {
      align-self: flex-start;
      background: #e8e8f0;
      color: #222;
      border-bottom-left-radius: 3px;
    }
    .loading {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
      font-style: italic;
    }

    /* Input */
    .panel-input {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      border-top: 1px solid #e0e0e0;
      background: white;
      gap: 4px;
      flex-shrink: 0;
    }
    .panel-input-field {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 7px 14px;
      font-size: 0.82rem;
      outline: none;
      background: #f5f5f5;
    }
    .panel-input-field:focus { border-color: #4F46E5; background: white; }
    .panel-input-field:disabled { opacity: 0.6; }
  `]
})
export class ChatbotPanelComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('panelMessages') panelMessages!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  unreadCount = 0;
  private sub!: Subscription;
  private shouldScroll = false;
  private lastSeenCount = 0;

  constructor(private chatService: ChatbotService) {}

  ngOnInit(): void {
    this.sub = this.chatService.messages$.subscribe(msgs => {
      this.messages = msgs;
      if (!this.isOpen) {
        this.unreadCount = msgs.filter(m => !m.isUser).length - this.lastSeenCount;
      }
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.isOpen) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.lastSeenCount = this.messages.filter(m => !m.isUser).length;
      this.unreadCount = 0;
      this.shouldScroll = true;
    }
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
        this.chatService.addBotMessage('Erreur de connexion. Réessayez.');
      }
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.panelMessages?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}

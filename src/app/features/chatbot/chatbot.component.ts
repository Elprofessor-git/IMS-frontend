import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

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
    MatSnackBarModule
  ],
  template: `
    <div class="chatbot-container">
      <mat-card class="chatbot-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>smart_toy</mat-icon>
            Assistant IA - Gestion Textile
          </mat-card-title>
          <mat-card-subtitle>
            Posez vos questions sur la gestion de stock, commandes, et plus encore
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="chat-messages" #chatContainer>
            <div 
              *ngFor="let message of messages" 
              class="message"
              [ngClass]="message.isUser ? 'user-message' : 'bot-message'">
              <div class="message-content">
                <div class="message-header">
                  <mat-icon *ngIf="!message.isUser">smart_toy</mat-icon>
                  <mat-icon *ngIf="message.isUser">person</mat-icon>
                  <span class="message-sender">
                    {{ message.isUser ? 'Vous' : 'Assistant IA' }}
                  </span>
                  <span class="message-time">
                    {{ message.timestamp | date:'HH:mm' }}
                  </span>
                </div>
                <div class="message-text">
                  {{ message.text }}
                </div>
              </div>
            </div>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="chat-input">
            <mat-form-field appearance="outline" class="message-input">
              <mat-label>Tapez votre message...</mat-label>
              <input 
                matInput 
                [(ngModel)]="newMessage" 
                (keyup.enter)="sendMessage()"
                placeholder="Ex: Combien d'articles sont en stock ?">
              <mat-icon matSuffix>send</mat-icon>
            </mat-form-field>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="sendMessage()"
              [disabled]="!newMessage.trim()">
              <mat-icon>send</mat-icon>
              Envoyer
            </button>
          </div>
        </mat-card-content>
      </mat-card>
      
      <mat-card class="suggestions-card">
        <mat-card-header>
          <mat-card-title>Suggestions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item 
              *ngFor="let suggestion of suggestions" 
              (click)="sendSuggestion(suggestion)"
              class="suggestion-item">
              <mat-icon matListItemIcon>lightbulb</mat-icon>
              <span matListItemTitle>{{ suggestion }}</span>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .chatbot-container {
      display: flex;
      gap: 20px;
      padding: 20px;
      height: calc(100vh - 120px);
    }
    
    .chatbot-card {
      flex: 2;
      display: flex;
      flex-direction: column;
    }
    
    .suggestions-card {
      flex: 1;
      max-width: 300px;
    }
    
    mat-card-header {
      border-bottom: 1px solid #eee;
      padding-bottom: 16px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 0;
      max-height: 400px;
    }
    
    .message {
      margin-bottom: 16px;
      display: flex;
    }
    
    .user-message {
      justify-content: flex-end;
    }
    
    .bot-message {
      justify-content: flex-start;
    }
    
    .message-content {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 12px;
      position: relative;
    }
    
    .user-message .message-content {
      background-color: #1976d2;
      color: white;
    }
    
    .bot-message .message-content {
      background-color: #f5f5f5;
      color: #333;
    }
    
    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      font-size: 0.85rem;
      opacity: 0.8;
    }
    
    .message-sender {
      font-weight: 500;
    }
    
    .message-time {
      margin-left: auto;
      font-size: 0.75rem;
    }
    
    .message-text {
      line-height: 1.4;
    }
    
    .chat-input {
      display: flex;
      gap: 12px;
      align-items: center;
      padding-top: 16px;
    }
    
    .message-input {
      flex: 1;
    }
    
    .suggestion-item {
      cursor: pointer;
      border-radius: 8px;
      margin-bottom: 8px;
      transition: background-color 0.2s;
    }
    
    .suggestion-item:hover {
      background-color: #f0f0f0;
    }
    
    @media (max-width: 768px) {
      .chatbot-container {
        flex-direction: column;
      }
      
      .suggestions-card {
        max-width: none;
      }
      
      .message-content {
        max-width: 85%;
      }
    }
  `]
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = [];
  newMessage: string = '';
  suggestions: string[] = [
    'Combien d\'articles sont en stock ?',
    'Quelles sont les commandes en cours ?',
    'Comment ajouter un nouvel article ?',
    'Quel est le statut de la production ?',
    'Comment gérer les fournisseurs ?',
    'Quels sont les mouvements récents ?'
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // Message de bienvenue
    this.addBotMessage('Bonjour ! Je suis votre assistant IA pour la gestion textile. Comment puis-je vous aider aujourd\'hui ?');
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    // Ajouter le message de l'utilisateur
    this.addUserMessage(this.newMessage);

    // Simuler une réponse de l'IA
    setTimeout(() => {
      this.processUserMessage(this.newMessage);
    }, 1000);

    this.newMessage = '';
  }

  sendSuggestion(suggestion: string): void {
    this.newMessage = suggestion;
    this.sendMessage();
  }

  private addUserMessage(text: string): void {
    this.messages.push({
      id: Date.now(),
      text,
      isUser: true,
      timestamp: new Date()
    });
  }

  private addBotMessage(text: string): void {
    this.messages.push({
      id: Date.now(),
      text,
      isUser: false,
      timestamp: new Date()
    });
  }

  private processUserMessage(message: string): void {
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('stock') || lowerMessage.includes('article')) {
      response = 'Pour consulter le stock, allez dans "Gestion de Stock" > "Stock". Vous y trouverez tous les articles avec leurs quantités disponibles.';
    } else if (lowerMessage.includes('commande')) {
      response = 'Les commandes clients se trouvent dans "Commandes & Production" > "Commandes Clients". Vous pouvez y voir le statut de toutes les commandes.';
    } else if (lowerMessage.includes('tâche') || lowerMessage.includes('production')) {
      response = 'Les tâches de production sont dans "Commandes & Production" > "Tâches de Production". Vous pouvez y assigner et suivre les tâches.';
    } else if (lowerMessage.includes('fournisseur') || lowerMessage.includes('client')) {
      response = 'La gestion des partenaires se fait dans "Partenaires" > "Clients & Fournisseurs". Vous pouvez y ajouter et gérer vos contacts.';
    } else if (lowerMessage.includes('achat') || lowerMessage.includes('importation')) {
      response = 'Les achats et importations se trouvent dans "Achats & Importations". Vous pouvez y gérer les commandes fournisseurs et les importations.';
    } else if (lowerMessage.includes('mouvement')) {
      response = 'Les mouvements de stock se trouvent dans "Gestion de Stock" > "Mouvements de Stock". Vous pouvez y voir l\'historique des entrées/sorties.';
    } else if (lowerMessage.includes('utilisateur') || lowerMessage.includes('admin')) {
      response = 'L\'administration se trouve dans "Administration". Vous pouvez y gérer les utilisateurs, rôles et paramètres.';
    } else {
      response = 'Je peux vous aider avec la gestion de stock, commandes, production, fournisseurs, et plus encore. Posez-moi une question spécifique !';
    }

    this.addBotMessage(response);
  }
} 
import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { marked } from 'marked';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  isHtml?: boolean;
}
@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, MatButtonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  isOpen = false;
  messages: ChatMessage[] = [];
  userMessage = '';
  loading = false;

  @ViewChild('chatBody') chatBody!: ElementRef;

  constructor(private http: HttpClient) { }

  toggleChat() {
    this.isOpen = !this.isOpen;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  async sendMessage() {
    if (!this.userMessage.trim()) return;

    this.loading = true;
    const userMsg = this.userMessage;
    this.messages.push({ text: userMsg, sender: 'user', isHtml: false });
    this.userMessage = '';
    this.scrollToBottom();

    this.http.post(`${environment.apiUrl}/ai-query`, { userQuery: userMsg }).subscribe(
      async (res: any) => {
        console.log("✅ AI Response from Backend:", res);

        let botReply = res?.result?.response || "I'm sorry, I couldn't process your request.";

        // ✅ Remove unnecessary surrounding quotes from backend response
        botReply = typeof botReply === 'string' ? botReply.replace(/^"(.*)"$/, '$1') : botReply;
        const formattedResponse = await marked(botReply);
        // ✅ Push formatted response without frontend modifications
        this.messages.push({ text: formattedResponse, sender: 'bot', isHtml: true });
        this.scrollToBottom();
        this.loading = false;
      },
      (error) => {
        console.error("❌ API Call Failed:", error);
        this.messages.push({ text: "Something went wrong. Please try again.", sender: 'bot' });
        this.loading = false;
      }
    );
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
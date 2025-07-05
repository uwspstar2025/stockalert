import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  typing?: boolean;
}

interface QuickReply {
  text: string;
  action: string;
}

@Component({
  selector: 'app-chatbot',
  template: `
    <div class="chatbot-container" [class.minimized]="isMinimized">
      <!-- Chat Toggle Button -->
      <button class="chat-toggle" (click)="toggleChat()" *ngIf="isMinimized">
        <mat-icon>chat</mat-icon>
        <span class="notification-badge" *ngIf="hasUnreadMessages">{{unreadCount}}</span>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" *ngIf="!isMinimized">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="bot-info">
            <div class="bot-avatar">
              <mat-icon>smart_toy</mat-icon>
            </div>
            <div class="bot-details">
              <h3>股票助手</h3>
              <span class="status" [class.online]="isOnline">
                {{ isOnline ? '在线' : '离线' }}
              </span>
            </div>
          </div>
          <div class="chat-controls">
            <button class="control-btn" (click)="clearChat()" title="清空聊天">
              <mat-icon>clear_all</mat-icon>
            </button>
            <button class="control-btn" (click)="toggleChat()" title="最小化">
              <mat-icon>remove</mat-icon>
            </button>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" #messagesContainer>
          <div class="welcome-message" *ngIf="messages.length === 0">
            <div class="welcome-avatar">
              <mat-icon>smart_toy</mat-icon>
            </div>
            <div class="welcome-text">
              <h4>欢迎使用股票助手！</h4>
              <p>我可以帮助您解答关于股票监控系统的任何问题。</p>
            </div>
          </div>

          <div class="message" 
               *ngFor="let msg of messages" 
               [class.user-message]="msg.sender === 'user'"
               [class.bot-message]="msg.sender === 'bot'">
            <div class="message-avatar" *ngIf="msg.sender === 'bot'">
              <mat-icon>smart_toy</mat-icon>
            </div>
            <div class="message-content">
              <div class="message-bubble" [innerHTML]="msg.message"></div>
              <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
            </div>
            <div class="message-avatar" *ngIf="msg.sender === 'user'">
              <mat-icon>person</mat-icon>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div class="message bot-message" *ngIf="isTyping">
            <div class="message-avatar">
              <mat-icon>smart_toy</mat-icon>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Replies -->
        <div class="quick-replies" *ngIf="quickReplies.length > 0">
          <button class="quick-reply" 
                  *ngFor="let reply of quickReplies" 
                  (click)="sendQuickReply(reply)">
            {{ reply.text }}
          </button>
        </div>

        <!-- Chat Input -->
        <div class="chat-input">
          <div class="input-container">
            <input type="text" 
                   #messageInput
                   [(ngModel)]="currentMessage" 
                   (keydown.enter)="sendMessage()"
                   placeholder="输入您的问题..."
                   [disabled]="isTyping">
            <button class="send-btn" 
                    (click)="sendMessage()" 
                    [disabled]="!currentMessage.trim() || isTyping">
              <mat-icon>send</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  isMinimized = true;
  isOnline = true;
  isTyping = false;
  currentMessage = '';
  messages: ChatMessage[] = [];
  quickReplies: QuickReply[] = [];
  hasUnreadMessages = false;
  unreadCount = 0;
  private shouldScrollToBottom = false;

  // Knowledge base for chatbot responses
  private knowledgeBase = {
    greetings: [
      '您好！我是您的股票助手，很高兴为您服务！',
      '欢迎！请问我可以为您做些什么？',
      '您好！有什么关于股票监控的问题我可以帮助您吗？'
    ],
    stockSelection: {
      keywords: ['选择股票', '添加股票', '股票选择', '监控股票', '面板'],
      response: `关于股票选择，我来为您介绍：

<strong>📊 如何添加股票到监控列表：</strong>
1. 点击侧边栏的"面板"进入股票选择页面
2. 使用搜索框输入股票代码或公司名称
3. 从搜索结果中选择要添加的股票
4. 点击"添加到监控"按钮

<strong>🔍 当前可监控的股票包括：</strong>
• TSLA - Tesla Inc.
• AAPL - Apple Inc.
• GOOGL - Alphabet Inc.
• MSFT - Microsoft Corp.
• NVDA - NVIDIA Corp.
• 等更多...

需要其他帮助吗？`
    },
    monitoring: {
      keywords: ['监控系统', '监控', '追踪', '历史', '实时数据'],
      response: `关于监控系统，让我详细介绍：

<strong>📈 监控系统功能：</strong>
• <strong>实时价格监控</strong>：每30秒自动更新股票价格
• <strong>策略执行</strong>：基于4%-20%经典策略
• <strong>连接状态</strong>：显示数据连接状态和最后更新时间
• <strong>价格变化</strong>：颜色编码显示涨跌情况

<strong>🎯 4%-20%策略说明：</strong>
• 买入条件：股价下跌4%时
• 卖出条件：股价上涨20%时

<strong>💡 使用技巧：</strong>
• 绿色表示上涨，红色表示下跌
• 点击"服务器重新开启"可手动刷新数据

还有什么想了解的吗？`
    },
    alerts: {
      keywords: ['提醒', '警报', '通知', '价格提醒'],
      response: `关于提醒系统：

<strong>🔔 提醒功能包括：</strong>
• <strong>价格提醒</strong>：设置目标价格，到达时自动通知
• <strong>涨跌提醒</strong>：设置涨跌幅度阈值
• <strong>技术指标提醒</strong>：基于技术分析的信号

<strong>⚙️ 如何设置提醒：</strong>
1. 进入"提醒"页面
2. 点击"创建新提醒"
3. 选择股票和触发条件
4. 设置通知方式
5. 保存提醒设置

<strong>📱 通知方式：</strong>
• 浏览器通知
• 邮件提醒
• 系统弹窗

需要设置特定的提醒吗？`
    },
    analysis: {
      keywords: ['分析', '图表', 'AI分析', '技术分析'],
      response: `关于智能分析功能：

<strong>🤖 AI分析包括：</strong>
• <strong>市场趋势分析</strong>：基于历史数据预测
• <strong>技术指标</strong>：RSI、MACD、移动平均线
• <strong>投资建议</strong>：买入/卖出/持有建议
• <strong>风险评估</strong>：投资风险等级评定

<strong>📊 图表功能：</strong>
• K线图显示
• 成交量分析
• 价格走势预测
• 关键支撑位和阻力位

<strong>⚠️ 重要提示：</strong>
AI分析仅供参考，投资决策请结合多种因素，谨慎投资。

想了解特定股票的分析吗？`
    },
    help: {
      keywords: ['帮助', '使用指南', '教程', '怎么用'],
      response: `这里是完整的使用指南：

<strong>🚀 快速开始：</strong>
1. <strong>选择策略</strong> - 在"配置"页面设置投资策略
2. <strong>添加股票</strong> - 在"面板"页面选择要监控的股票
3. <strong>设置提醒</strong> - 在"提醒"页面配置价格警报
4. <strong>开始监控</strong> - 在"历史"页面查看实时数据

<strong>📚 详细功能：</strong>
• <strong>配置</strong>：策略选择和风险设置
• <strong>面板</strong>：股票搜索和添加
• <strong>历史</strong>：实时监控和数据追踪
• <strong>分析</strong>：AI智能分析和建议
• <strong>提醒</strong>：价格和指标警报

<strong>💡 使用技巧：</strong>
• 定期检查连接状态
• 合理设置提醒阈值
• 关注技术指标变化

还有具体问题吗？`
    }
  };

  constructor() {}

  ngOnInit() {
    this.initializeQuickReplies();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat() {
    this.isMinimized = !this.isMinimized;
    if (!this.isMinimized) {
      this.hasUnreadMessages = false;
      this.unreadCount = 0;
      setTimeout(() => {
        if (this.messageInput) {
          this.messageInput.nativeElement.focus();
        }
      }, 100);
    }
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isTyping) return;

    const userMessage: ChatMessage = {
      id: this.generateId(),
      message: this.currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.shouldScrollToBottom = true;

    const userInput = this.currentMessage;
    this.currentMessage = '';
    this.quickReplies = [];

    // Simulate bot typing
    this.isTyping = true;
    
    setTimeout(() => {
      const botResponse = this.generateBotResponse(userInput);
      const botMessage: ChatMessage = {
        id: this.generateId(),
        message: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      this.messages.push(botMessage);
      this.isTyping = false;
      this.shouldScrollToBottom = true;
      this.generateQuickReplies(userInput);

      if (this.isMinimized) {
        this.hasUnreadMessages = true;
        this.unreadCount++;
      }
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }

  sendQuickReply(reply: QuickReply) {
    this.currentMessage = reply.text;
    this.sendMessage();
  }

  clearChat() {
    this.messages = [];
    this.quickReplies = [];
    this.initializeQuickReplies();
  }

  private generateBotResponse(userInput: string): string {
    const input = userInput.toLowerCase();

    // Check for greetings
    if (input.includes('你好') || input.includes('您好') || input.includes('hi') || input.includes('hello')) {
      return this.getRandomGreeting();
    }

    // Check knowledge base
    for (const [key, knowledge] of Object.entries(this.knowledgeBase)) {
      if (key === 'greetings') continue;
      
      const kb = knowledge as any;
      if (kb.keywords && kb.keywords.some((keyword: string) => input.includes(keyword))) {
        return kb.response;
      }
    }

    // Default response with suggestions
    return `我理解您的问题，但可能需要更具体的信息。我可以帮助您了解：

<strong>🔍 常见问题：</strong>
• 如何选择和添加股票
• 监控系统的使用方法
• 设置价格提醒
• AI分析功能
• 系统使用指南

请选择下方的快捷回复或直接描述您的具体问题！`;
  }

  private generateQuickReplies(userInput: string) {
    const input = userInput.toLowerCase();
    
    if (input.includes('股票') || input.includes('选择')) {
      this.quickReplies = [
        { text: '如何添加股票？', action: 'stock_add' },
        { text: '查看监控列表', action: 'stock_list' },
        { text: '股票筛选条件', action: 'stock_filter' }
      ];
    } else if (input.includes('监控') || input.includes('实时')) {
      this.quickReplies = [
        { text: '监控系统功能', action: 'monitor_features' },
        { text: '4%-20%策略说明', action: 'strategy_explain' },
        { text: '数据更新频率', action: 'data_frequency' }
      ];
    } else {
      this.quickReplies = [
        { text: '使用指南', action: 'help_guide' },
        { text: '功能介绍', action: 'features' },
        { text: '常见问题', action: 'faq' }
      ];
    }
  }

  private initializeQuickReplies() {
    this.quickReplies = [
      { text: '如何开始使用？', action: 'getting_started' },
      { text: '股票选择指南', action: 'stock_selection' },
      { text: '监控系统介绍', action: 'monitoring_intro' },
      { text: '设置提醒', action: 'setup_alerts' }
    ];
  }

  private getRandomGreeting(): string {
    const greetings = this.knowledgeBase.greetings;
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}

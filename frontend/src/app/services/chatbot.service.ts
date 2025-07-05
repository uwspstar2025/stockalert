import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  category?: string;
}

export interface ChatSession {
  id: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly STORAGE_KEY = 'stocktracker_chat_history';
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private currentSession: ChatSession;

  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.initializeSession();
    this.loadChatHistory();
  }

  private initializeSession() {
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0
    };
  }

  addMessage(message: ChatMessage) {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = [...currentMessages, message];
    
    this.messagesSubject.next(updatedMessages);
    this.currentSession.lastActivity = new Date();
    this.currentSession.messageCount++;
    
    this.saveChatHistory(updatedMessages);
  }

  clearMessages() {
    this.messagesSubject.next([]);
    this.clearChatHistory();
    this.initializeSession();
  }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  generateResponse(userInput: string): string {
    const input = userInput.toLowerCase().trim();
    
    // Enhanced response system with categories
    const responses = this.getResponseByCategory(input);
    return responses;
  }

  private getResponseByCategory(input: string): string {
    // Stock selection queries
    if (this.matchesKeywords(input, ['选择', '添加', '股票', '面板', '监控'])) {
      return this.getStockSelectionResponse(input);
    }
    
    // Monitoring system queries
    if (this.matchesKeywords(input, ['监控', '追踪', '实时', '历史', '价格'])) {
      return this.getMonitoringResponse(input);
    }
    
    // Strategy queries
    if (this.matchesKeywords(input, ['策略', '4%', '20%', '买入', '卖出'])) {
      return this.getStrategyResponse(input);
    }
    
    // Alert system queries
    if (this.matchesKeywords(input, ['提醒', '警报', '通知', '设置'])) {
      return this.getAlertsResponse(input);
    }
    
    // Analysis queries
    if (this.matchesKeywords(input, ['分析', 'AI', '图表', '技术', '指标'])) {
      return this.getAnalysisResponse(input);
    }
    
    // Technical support
    if (this.matchesKeywords(input, ['问题', '错误', '不工作', '故障', '连接'])) {
      return this.getTechnicalSupportResponse(input);
    }
    
    // Greetings
    if (this.matchesKeywords(input, ['你好', '您好', 'hi', 'hello', '帮助'])) {
      return this.getGreetingResponse();
    }
    
    // Default response with suggestions
    return this.getDefaultResponse();
  }

  private getStockSelectionResponse(input: string): string {
    if (input.includes('如何') || input.includes('怎么')) {
      return `<strong>📊 股票选择详细指南：</strong>

<strong>🔍 添加股票的步骤：</strong>
1. 点击侧边栏的"面板"图标
2. 在搜索框中输入股票代码（如：TSLA）或公司名称
3. 从搜索结果中点击您想要的股票
4. 点击股票卡片上的复选框
5. 系统会自动添加到监控列表

<strong>💡 选择建议：</strong>
• 优先选择熟悉的行业股票
• 关注成交量活跃的股票
• 考虑分散投资不同板块

<strong>🎯 当前热门股票：</strong>
• 科技股：TSLA, AAPL, GOOGL, MSFT
• 芯片股：NVDA, AVGO
• 互联网：META, AMZN

需要了解特定股票信息吗？`;
    }
    
    return `<strong>📈 关于股票选择：</strong>

系统当前支持监控多只热门股票，包括特斯拉(TSLA)、苹果(AAPL)、谷歌(GOOGL)等。

<strong>主要功能：</strong>
• 实时价格显示
• 涨跌幅颜色编码
• 一键添加到监控
• 智能筛选功能

想了解如何添加特定股票吗？`;
  }

  private getMonitoringResponse(input: string): string {
    if (input.includes('频率') || input.includes('更新')) {
      return `<strong>⏱️ 数据更新频率说明：</strong>

<strong>实时数据更新：</strong>
• 股票价格：每30秒自动更新
• 连接状态：实时监控
• 系统状态：持续检测

<strong>🔄 自动刷新机制：</strong>
• 页面保持活跃时自动更新
• 网络断开时自动重连
• 手动刷新："服务器重新开启"按钮

<strong>📊 显示信息：</strong>
• 当前价格（实时）
• 涨跌幅度（百分比）
• 最后更新时间
• 连接状态指示

数据来源稳定，延迟控制在30秒内！`;
    }
    
    return `<strong>📊 监控系统功能介绍：</strong>

<strong>🎯 核心功能：</strong>
• 实时价格监控（30秒更新）
• 4%-20%策略执行
• 连接状态显示
• 历史数据追踪

<strong>📈 视觉指示：</strong>
• 🟢 绿色：股价上涨
• 🔴 红色：股价下跌
• 🔵 蓝色：系统状态良好
• ⚡ 闪烁：实时监控中

<strong>💡 使用技巧：</strong>
关注颜色变化，及时把握市场动向！`;
  }

  private getStrategyResponse(input: string): string {
    return `<strong>🎯 4%-20%经典策略详解：</strong>

<strong>📉 买入信号（4%策略）：</strong>
• 当股价从近期高点下跌4%时触发买入
• 适合捕捉短期回调机会
• 降低追高风险

<strong>📈 卖出信号（20%策略）：</strong>
• 当股价从买入点上涨20%时触发卖出
• 锁定合理利润
• 避免贪心导致的损失

<strong>⚡ 策略优势：</strong>
• 风险可控：最大损失有限
• 收益明确：目标收益率20%
• 操作简单：自动化执行
• 适合波动市场

<strong>⚠️ 注意事项：</strong>
策略需要结合市场环境，建议配合技术分析使用！`;
  }

  private getAlertsResponse(input: string): string {
    return `<strong>🔔 智能提醒系统：</strong>

<strong>📱 提醒类型：</strong>
• 价格提醒：到达目标价格时通知
• 涨跌提醒：超过设定涨跌幅时触发
• 策略提醒：4%-20%信号提醒
• 技术指标提醒：RSI、MACD等

<strong>⚙️ 设置步骤：</strong>
1. 进入"提醒"页面
2. 点击"创建新提醒"
3. 选择股票和条件
4. 设置通知方式
5. 保存并激活

<strong>📲 通知渠道：</strong>
• 浏览器弹窗通知
• 系统消息提示
• 邮件提醒（可选）

<strong>💡 建议：</strong>
合理设置提醒阈值，避免过度频繁的通知！`;
  }

  private getAnalysisResponse(input: string): string {
    return `<strong>🤖 AI智能分析系统：</strong>

<strong>📊 分析功能：</strong>
• 趋势分析：基于历史数据预测
• 技术指标：RSI、MACD、布林带
• 支撑阻力：关键价位识别
• 风险评估：投资风险等级

<strong>📈 图表工具：</strong>
• K线图显示
• 成交量分析
• 移动平均线
• 价格通道

<strong>🎯 投资建议：</strong>
• 买入/卖出/持有建议
• 目标价位预测
• 风险提示

<strong>⚠️ 重要声明：</strong>
AI分析仅供参考，投资决策请结合多种因素，理性投资！`;
  }

  private getTechnicalSupportResponse(input: string): string {
    return `<strong>🔧 技术支持：</strong>

<strong>常见问题解决：</strong>

<strong>🌐 连接问题：</strong>
• 检查网络连接
• 点击"服务器重新开启"按钮
• 刷新页面重试

<strong>📊 数据异常：</strong>
• 数据延迟：正常情况下30秒内更新
• 价格不准确：可能是网络延迟导致
• 刷新页面获取最新数据

<strong>🔔 功能异常：</strong>
• 提醒不工作：检查浏览器通知权限
• 页面显示错误：清除浏览器缓存
• 操作无响应：重新登录系统

<strong>📞 联系支持：</strong>
如问题持续，请联系技术支持团队！`;
  }

  private getGreetingResponse(): string {
    const greetings = [
      `您好！👋 我是您的专属股票助手！

我可以帮助您：
• 📊 学习如何选择和监控股票
• 🎯 了解4%-20%交易策略
• 🔔 设置智能价格提醒
• 📈 解读AI分析报告
• 🛠️ 解决技术问题

请告诉我您想了解什么，或点击下方快捷选项！`,

      `欢迎来到股票监控系统！🚀

作为您的AI助手，我将为您提供：
• 专业的股票投资指导
• 实时的市场数据解读
• 个性化的策略建议
• 及时的技术支持

有什么问题尽管问我，我随时为您服务！`,

      `您好！很高兴为您服务！💼

我是专业的股票投资助手，具备：
• 丰富的市场知识
• 实时数据分析能力
• 智能策略推荐
• 7×24小时在线服务

让我们开始您的投资之旅吧！`
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private getDefaultResponse(): string {
    return `我理解您的问题！让我为您提供一些常用功能：

<strong>🔍 我可以帮助您：</strong>
• <strong>股票选择</strong>：如何添加和管理监控股票
• <strong>实时监控</strong>：监控系统的使用方法
• <strong>交易策略</strong>：4%-20%策略详解
• <strong>智能提醒</strong>：设置价格和技术指标提醒
• <strong>数据分析</strong>：AI分析功能使用
• <strong>技术支持</strong>：解决使用中的问题

<strong>💡 提示：</strong>
您可以直接询问"如何添加股票"或"监控系统怎么用"等具体问题，我会为您详细解答！

请选择您感兴趣的功能，或直接描述您的问题！`;
  }

  private matchesKeywords(input: string, keywords: string[]): boolean {
    return keywords.some(keyword => input.includes(keyword));
  }

  private generateSessionId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private saveChatHistory(messages: ChatMessage[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.warn('Could not save chat history:', error);
    }
  }

  private loadChatHistory() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const messages = JSON.parse(saved);
        // Only load recent messages (last 50)
        const recentMessages = messages.slice(-50);
        this.messagesSubject.next(recentMessages);
      }
    } catch (error) {
      console.warn('Could not load chat history:', error);
    }
  }

  private clearChatHistory() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Could not clear chat history:', error);
    }
  }

  // Analytics methods
  getSessionInfo(): ChatSession {
    return this.currentSession;
  }

  getMessageCount(): number {
    return this.messagesSubject.value.length;
  }
}

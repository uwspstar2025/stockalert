import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  template: `
    <div class="container">
      <div class="header">
        <h1>帮助中心</h1>
        <p>欢迎使用股票监控系统！这里将为您详细介绍如何使用本平台。</p>
      </div>

      <!-- 快速开始 -->
      <div class="help-section">
        <h2>🚀 快速开始</h2>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>选择交易策略</h3>
            <p>首先前往"配置"页面，选择适合您的交易策略。系统提供多种策略供您选择，包括趋势跟踪、均值回归等。</p>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h3>选择监控股票</h3>
            <p>在"面板"页面选择您想要监控的股票。您可以通过搜索、筛选等方式快速找到目标股票。</p>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h3>设置提醒</h3>
            <p>在"提醒"页面配置价格警报、技术指标提醒等，确保不错过任何交易机会。</p>
          </div>
          <div class="step-card">
            <div class="step-number">4</div>
            <h3>监控和分析</h3>
            <p>使用"历史"和"分析"页面跟踪您的投资表现，获取AI驱动的市场洞察。</p>
          </div>
        </div>
      </div>

      <!-- 功能详解 -->
      <div class="help-section">
        <h2>🛠️ 功能详解</h2>
        <div class="features-grid">
          
          <div class="feature-card">
            <div class="feature-icon">
              <mat-icon>settings</mat-icon>
            </div>
            <h3>配置 - 交易策略选择</h3>
            <ul>
              <li>选择适合您风险偏好的交易策略</li>
              <li>查看策略的历史回测数据</li>
              <li>了解每种策略的风险和收益特征</li>
              <li>一键应用策略到您的投资组合</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <mat-icon>dashboard</mat-icon>
            </div>
            <h3>面板 - 股票选择</h3>
            <ul>
              <li>浏览热门股票和推荐股票</li>
              <li>使用搜索功能快速找到目标股票</li>
              <li>按市场、行业、价格等条件筛选</li>
              <li>查看实时价格和基本面数据</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <mat-icon>trending_up</mat-icon>
            </div>
            <h3>历史 - 追踪系统</h3>
            <ul>
              <li>实时监控已选股票的价格变动</li>
              <li>查看投资组合的整体表现</li>
              <li>跟踪策略执行情况</li>
              <li>生成投资报告和统计数据</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <mat-icon>analytics</mat-icon>
            </div>
            <h3>分析 - AI智能分析</h3>
            <ul>
              <li>获取AI驱动的市场分析</li>
              <li>查看技术指标和图表分析</li>
              <li>接收投资建议和风险提示</li>
              <li>市场趋势预测和洞察</li>
            </ul>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <mat-icon>notifications</mat-icon>
            </div>
            <h3>提醒 - 警报系统</h3>
            <ul>
              <li>设置价格涨跌警报</li>
              <li>配置技术指标提醒</li>
              <li>选择通知方式（邮件、短信等）</li>
              <li>管理和查看历史警报</li>
            </ul>
          </div>

        </div>
      </div>

      <!-- 常见问题 -->
      <div class="help-section">
        <h2>❓ 常见问题</h2>
        <div class="faq-list">
          
          <div class="faq-item">
            <h3>如何开始使用该系统？</h3>
            <p>建议新用户按照以下顺序使用：1) 选择交易策略 → 2) 选择要监控的股票 → 3) 设置价格提醒 → 4) 开始监控和分析。</p>
          </div>

          <div class="faq-item">
            <h3>数据多久更新一次？</h3>
            <p>股票价格数据实时更新，分析数据每15分钟更新一次，基本面数据每日更新。</p>
          </div>

          <div class="faq-item">
            <h3>可以同时监控多少只股票？</h3>
            <p>您可以同时监控最多50只股票。建议重点关注10-20只核心股票以获得最佳效果。</p>
          </div>

          <div class="faq-item">
            <h3>如何设置有效的提醒？</h3>
            <p>建议设置关键支撑位和阻力位的价格提醒，以及重要技术指标（如RSI、MACD）的信号提醒。</p>
          </div>

          <div class="faq-item">
            <h3>AI分析的准确性如何？</h3>
            <p>AI分析基于历史数据和技术指标，仅供参考。投资决策应结合多种因素，请谨慎投资。</p>
          </div>

        </div>
      </div>

      <!-- 使用技巧 -->
      <div class="help-section">
        <h2>💡 使用技巧</h2>
        <div class="tips-grid">
          
          <div class="tip-card">
            <div class="tip-icon">🎯</div>
            <h3>制定投资计划</h3>
            <p>使用策略选择功能制定清晰的投资计划，并坚持执行。不要频繁更换策略。</p>
          </div>

          <div class="tip-card">
            <div class="tip-icon">📊</div>
            <h3>分散投资风险</h3>
            <p>选择不同行业、不同市值的股票进行组合投资，降低单一股票风险。</p>
          </div>

          <div class="tip-card">
            <div class="tip-icon">⏰</div>
            <h3>定期检查</h3>
            <p>建议每日查看追踪系统，每周回顾投资表现，每月调整投资组合。</p>
          </div>

          <div class="tip-card">
            <div class="tip-icon">🛡️</div>
            <h3>风险控制</h3>
            <p>设置止损点，合理使用提醒功能，不要让情绪影响投资决策。</p>
          </div>

        </div>
      </div>

      <!-- 联系支持 -->
      <div class="help-section contact-section">
        <h2>📞 需要帮助？</h2>
        <p>如果您在使用过程中遇到任何问题，请联系我们的支持团队：</p>
        <div class="contact-info">
          <div class="contact-item">
            <mat-icon>email</mat-icon>
            <span>support&#64;stocktracker.com</span>
          </div>
          <div class="contact-item">
            <mat-icon>phone</mat-icon>
            <span>400-888-9999</span>
          </div>
          <div class="contact-item">
            <mat-icon>schedule</mat-icon>
            <span>工作时间：周一至周五 9:00-18:00</span>
          </div>
        </div>
      </div>

    </div>
  `,
  styleUrls: ['./help.component.scss']
})
export class HelpComponent {
  constructor() {}
}

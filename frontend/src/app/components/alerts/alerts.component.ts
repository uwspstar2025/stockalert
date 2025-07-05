import { Component } from '@angular/core';

@Component({
  selector: 'app-alerts',
  template: `
    <div class="container">
      <div class="header">
        <h1>🔔 价格提醒设置</h1>
        <p>配置智能价格提醒，第一时间把握交易机会</p>
      </div>

      <!-- 快速设置区域 -->
      <div class="quick-setup-section">
        <h2>📊 快速设置提醒</h2>
        <div class="setup-cards">
          <div class="setup-card">
            <div class="card-icon">📈</div>
            <h3>价格突破提醒</h3>
            <p>当股价突破关键阻力位或支撑位时提醒</p>
            <button class="btn btn-primary">设置突破提醒</button>
          </div>
          
          <div class="setup-card">
            <div class="card-icon">📉</div>
            <h3>跌幅预警</h3>
            <p>当股价下跌超过设定百分比时及时预警</p>
            <button class="btn btn-primary">设置跌幅预警</button>
          </div>
          
          <div class="setup-card">
            <div class="card-icon">💰</div>
            <h3>目标价位提醒</h3>
            <p>当股价达到您的买入或卖出目标价时提醒</p>
            <button class="btn btn-primary">设置目标价位</button>
          </div>
        </div>
      </div>

      <!-- 提醒方式 -->
      <div class="notification-methods">
        <h2>🚀 提醒方式</h2>
        <div class="methods-grid">
          <div class="method-card">
            <div class="method-icon email">
              <mat-icon>email</mat-icon>
            </div>
            <h3>邮件提醒</h3>
            <p>发送详细的价格分析报告到您的邮箱</p>
            <div class="status-badge active">已启用</div>
          </div>
          
          <div class="method-card">
            <div class="method-icon sms">
              <mat-icon>sms</mat-icon>
            </div>
            <h3>短信提醒</h3>
            <p>重要价格变动时发送短信到您的手机</p>
            <div class="status-badge inactive">未启用</div>
          </div>
          
          <div class="method-card">
            <div class="method-icon push">
              <mat-icon>notifications</mat-icon>
            </div>
            <h3>推送通知</h3>
            <p>实时推送价格变动通知到您的设备</p>
            <div class="status-badge active">已启用</div>
          </div>
          
          <div class="method-card">
            <div class="method-icon webhook">
              <mat-icon>webhook</mat-icon>
            </div>
            <h3>Webhook</h3>
            <p>集成到您的交易系统或第三方应用</p>
            <div class="status-badge inactive">未启用</div>
          </div>
        </div>
      </div>

      <!-- 当前提醒列表 -->
      <div class="alerts-list">
        <h2>📋 当前提醒列表</h2>
        <div class="alerts-grid">
          <div class="alert-card active">
            <div class="alert-header">
              <div class="stock-info">
                <h4>TSLA</h4>
                <span class="stock-name">Tesla Inc.</span>
              </div>
              <div class="alert-type price-up">价格突破</div>
            </div>
            <div class="alert-details">
              <div class="detail-item">
                <span class="label">触发价格</span>
                <span class="value">\$185.00</span>
              </div>
              <div class="detail-item">
                <span class="label">当前价格</span>
                <span class="value current">\$177.97</span>
              </div>
              <div class="detail-item">
                <span class="label">创建时间</span>
                <span class="value">2小时前</span>
              </div>
            </div>
            <div class="alert-actions">
              <button class="btn btn-outline btn-small">编辑</button>
              <button class="btn btn-danger btn-small">删除</button>
            </div>
          </div>
          
          <div class="alert-card triggered">
            <div class="alert-header">
              <div class="stock-info">
                <h4>AAPL</h4>
                <span class="stock-name">Apple Inc.</span>
              </div>
              <div class="alert-type price-down">跌幅预警</div>
            </div>
            <div class="alert-details">
              <div class="detail-item">
                <span class="label">预警跌幅</span>
                <span class="value">-5%</span>
              </div>
              <div class="detail-item">
                <span class="label">当前跌幅</span>
                <span class="value warning">-3.2%</span>
              </div>
              <div class="detail-item">
                <span class="label">已触发</span>
                <span class="value">30分钟前</span>
              </div>
            </div>
            <div class="alert-actions">
              <button class="btn btn-outline btn-small">查看详情</button>
              <button class="btn btn-success btn-small">重新激活</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 高级设置 -->
      <div class="advanced-settings">
        <h2>⚙️ 高级设置</h2>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <h4>智能降噪</h4>
              <p>过滤掉不重要的价格波动，只在关键时刻提醒</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4>交易时间外提醒</h4>
              <p>在非交易时间也接收价格变动提醒</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox">
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4>每日汇总报告</h4>
              <p>每天发送价格变动汇总报告</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent {}

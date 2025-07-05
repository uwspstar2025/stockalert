import { Component } from '@angular/core';

@Component({
  selector: 'app-alerts',
  template: `
    <div class="container">
      <div class="header">
        <h1>价格提醒设置</h1>
        <p>价格提醒功能即将推出，支持多种提醒方式和智能触发条件。</p>
      </div>

      <div class="alerts-card">
        <div class="bell-icon">
          <mat-icon>notifications</mat-icon>
        </div>
        
        <h2>价格提醒功能</h2>
        <p>价格提醒功能即将推出，支持多种提醒方式实现智能触发条件。</p>
        
        <div class="features-grid">
          <div class="feature-card">
            <mat-icon>email</mat-icon>
            <h3>邮件提醒</h3>
          </div>
          <div class="feature-card">
            <mat-icon>sms</mat-icon>
            <h3>短信提醒</h3>
          </div>
          <div class="feature-card">
            <mat-icon>schedule</mat-icon>
            <h3>智能触发</h3>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent {}

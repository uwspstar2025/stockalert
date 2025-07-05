import { Component } from '@angular/core';

@Component({
  selector: 'app-portfolio',
  template: `
    <div class="container">
      <div class="header">
        <h1>投资组合管理</h1>
        <p>投资组合管理功能正在开发中，将为您提供最佳持仓分析和风险评估工具。</p>
      </div>

      <div class="coming-soon-card">
        <div class="icon">
          <mat-icon>work</mat-icon>
        </div>
        <h2>功能开发中</h2>
        <p>我们正在努力开发以下功能：</p>
        
        <div class="features-list">
          <div class="feature">
            <mat-icon>analytics</mat-icon>
            <span>持仓分析</span>
          </div>
          <div class="feature">
            <mat-icon>assessment</mat-icon>
            <span>收益统计</span>
          </div>
          <div class="feature">
            <mat-icon>pie_chart</mat-icon>
            <span>风险评估</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent {}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';

@Component({
  selector: 'app-tracking-system',
  template: `
    <div class="container">
      <div class="header">
        <h1>股票追踪系统</h1>
        <p>监控1只股票-经典4%-20%策略</p>
      </div>

      <div class="alert-banner" *ngIf="connectionError">
        <mat-icon>error</mat-icon>
        <span>获取股票数据失败，请检查网络连接</span>
        <button class="close-btn" (click)="dismissAlert()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="alert-banner success" *ngIf="!connectionError && !loading">
        <mat-icon>check_circle</mat-icon>
        <span>数据连接正常</span>
      </div>

      <div class="strategy-card">
        <h2>交易策略-经典4%-20%策略</h2>
        
        <div class="strategy-metrics">
          <div class="metric">
            <label>买入触发条件:</label>
            <div class="value">下跌 4%</div>
          </div>
          
          <div class="metric">
            <label>卖出触发条件:</label>
            <div class="value">上涨 20%</div>
          </div>
        </div>

        <div class="status-section">
          <div class="status-icon">
            <mat-icon>bar_chart</mat-icon>
          </div>
          <div class="status-text">
            <h3>暂无数据配置</h3>
            <p>请在右侧添加股票并开启数据流服务</p>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn btn-danger" (click)="restartService()">
            <mat-icon>refresh</mat-icon>
            服务器重新开启
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./tracking-system.component.scss']
})
export class TrackingSystemComponent implements OnInit {
  connectionError = false;
  loading = false;

  constructor(
    private router: Router,
    private stockService: StockService
  ) {}

  ngOnInit() {
    this.checkConnection();
  }

  checkConnection() {
    this.loading = true;
    this.stockService.getAllStocks().subscribe({
      next: (response) => {
        this.connectionError = false;
        this.loading = false;
        console.log('Stock data loaded successfully');
      },
      error: (err) => {
        this.connectionError = true;
        this.loading = false;
        console.error('Failed to load stock data:', err);
      }
    });
  }

  dismissAlert() {
    this.connectionError = false;
  }

  restartService() {
    console.log('Restarting service...');
    this.checkConnection();
  }
}

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
        <span>数据连接正常 - 最后更新: {{ lastUpdate }}</span>
      </div>

      <div class="alert-banner warning" *ngIf="loading">
        <mat-icon>sync</mat-icon>
        <span>正在获取股票数据...</span>
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
          <div class="status-text" *ngIf="stockData.length === 0">
            <h3>暂无数据配置</h3>
            <p>请在右侧添加股票并开启数据流服务</p>
          </div>
          <div class="status-text" *ngIf="stockData.length > 0">
            <h3>监控系统运行中</h3>
            <p>正在监控 {{ stockData.length }} 只股票</p>
          </div>
        </div>

        <!-- Stock monitoring grid -->
        <div class="stock-grid" *ngIf="stockData.length > 0">
          <div class="stock-item" *ngFor="let stock of stockData">
            <div class="stock-header">
              <h4>{{ stock.symbol }}</h4>
              <div class="price" [class.positive]="stock.change > 0" [class.negative]="stock.change < 0">
                ¥{{ stock.price }}
              </div>
            </div>
            <div class="stock-info">
              <div class="company-name">{{ stock.name }}</div>
              <div class="change" [class.positive]="stock.change > 0" [class.negative]="stock.change < 0">
                {{ stock.change > 0 ? '+' : '' }}{{ stock.change }}%
              </div>
            </div>
            <div class="monitoring-status">
              <mat-icon>radio_button_checked</mat-icon>
              <span>监控中</span>
            </div>
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
  stockData: any[] = [];
  lastUpdate: string = '';

  constructor(
    private router: Router,
    private stockService: StockService
  ) {}

  ngOnInit() {
    this.checkConnection();
    // Set up periodic updates every 30 seconds
    setInterval(() => {
      this.checkConnection();
    }, 30000);
  }

  checkConnection() {
    this.loading = true;
    this.stockService.getAllStocks().subscribe({
      next: (response) => {
        this.connectionError = false;
        this.loading = false;
        this.stockData = response.data || [];
        this.lastUpdate = new Date().toLocaleTimeString('zh-CN');
        console.log('Stock data loaded successfully', response);
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

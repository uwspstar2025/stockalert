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
        <span>获取股票数据失败: {{ errorMessage }}</span>
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
          <div class="status-text" *ngIf="stockData.length === 0 && !loading && !connectionError">
            <h3>暂无数据配置</h3>
            <p>请点击"测试API连接"按钮检查服务器连接</p>
          </div>
          <div class="status-text" *ngIf="stockData.length === 0 && loading">
            <h3>正在加载数据...</h3>
            <p>请稍候...</p>
          </div>
          <div class="status-text" *ngIf="stockData.length > 0">
            <h3>监控系统运行中</h3>
            <p>正在监控 {{ stockData.length }} 只股票</p>
          </div>
        </div>

        <!-- Debug information -->
        <div class="debug-section" style="background: #1e1e1e; border: 1px solid #333; padding: 10px; margin: 10px 0; font-family: monospace; font-size: 12px;">
          <h4>调试信息</h4>
          <p>连接状态: {{ connectionError ? '连接失败' : '正常' }}</p>
          <p>加载状态: {{ loading ? '加载中' : '完成' }}</p>
          <p>股票数据数量: {{ stockData.length }}</p>
          <p>错误信息: {{ errorMessage || '无' }}</p>
          <p>最后更新: {{ lastUpdate || '未更新' }}</p>
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
          <button class="btn btn-primary" (click)="testApi()" style="margin-left: 10px;">
            <mat-icon>bug_report</mat-icon>
            测试API连接
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
  errorMessage: string = '';

  constructor(
    private router: Router,
    private stockService: StockService
  ) {}

  ngOnInit() {
    console.log('TrackingSystemComponent initialized');
    console.log('Stock service API URL:', this.stockService['apiUrl']);
    
    // Initial load
    this.checkConnection();
    
    // Set up periodic updates every 30 seconds
    setInterval(() => {
      console.log('Auto-refreshing stock data...');
      this.checkConnection();
    }, 30000);
  }

  checkConnection() {
    this.loading = true;
    console.log('Attempting to fetch data from:', `${this.stockService['apiUrl']}/stocks`);
    this.stockService.getAllStocks().subscribe({
      next: (response) => {
        this.connectionError = false;
        this.loading = false;
        this.stockData = response.data || [];
        this.lastUpdate = new Date().toLocaleTimeString('zh-CN');
        console.log('Stock data loaded successfully', response);
        console.log('Number of stocks loaded:', this.stockData.length);
      },
      error: (err) => {
        this.connectionError = true;
        this.loading = false;
        this.errorMessage = err.status ? `HTTP ${err.status}: ${err.message || err.statusText}` : err.message || 'Unknown error';
        console.error('Failed to load stock data:', err);
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          url: err.url
        });
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

  testApi() {
    console.log('=== Testing API manually ===');
    console.log('API URL:', `${this.stockService['apiUrl']}/stocks`);
    
    // Test using fetch directly
    fetch('http://localhost:3000/api/stocks')
      .then(response => {
        console.log('Fetch response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Fetch success:', data);
        alert(`API Test Success! Found ${data.data?.length || 0} stocks`);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        alert(`API Test Failed: ${error.message}`);
      });
  }
}

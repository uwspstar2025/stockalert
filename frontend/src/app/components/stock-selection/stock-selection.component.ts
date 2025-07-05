import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  selected: boolean;
  featured?: boolean;
  volume?: number;
}

@Component({
  selector: 'app-stock-selection',
  template: `
    <div class="container">
      <div class="header">
        <h1>选择要监控的股票</h1>
        <p>选择你想要监控交易的股票代码</p>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner">⟳</div>
        <p>正在加载股票数据...</p>
      </div>

      <!-- 错误状态 -->
      <div *ngIf="error && !loading" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>{{ error }}</h3>
        <button class="btn btn-primary" (click)="loadStocks()">重试</button>
      </div>

      <!-- 股票网格 -->
      <div *ngIf="!loading && !error" class="stocks-grid">
        <div class="stock-card" 
             *ngFor="let stock of stocks"
             [class.selected]="stock.selected"
             [class.featured]="stock.featured"
             (click)="toggleStock(stock)">
          
          <div class="stock-header">
            <div class="stock-info">
              <h3>{{ stock.symbol }}</h3>
              <p>{{ stock.name }}</p>
            </div>
            
            <mat-checkbox 
              [checked]="stock.selected"
              (change)="toggleStock(stock)"
              (click)="$event.stopPropagation()">
            </mat-checkbox>
          </div>
          
          <div class="stock-price">
            <span class="price">\${{ stock.price }}</span>
            <span class="change" [ngClass]="stock.change >= 0 ? 'positive' : 'negative'">
              {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
            </span>
          </div>
          
          <button class="details-btn" 
                  *ngIf="!stock.featured"
                  (click)="viewDetails(stock); $event.stopPropagation()">
            详情
          </button>
          
          <div class="featured-badge" *ngIf="stock.featured">
            <mat-icon>check</mat-icon>
            <span>已选择</span>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !error" class="action-section">
        <div class="selected-count">
          已选择 {{ getSelectedCount() }} 只股票
        </div>
        
        <button class="next-btn btn btn-primary" 
                [disabled]="getSelectedCount() === 0"
                (click)="proceedToNext()">
          下一步：选择交易策略
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./stock-selection.component.scss']
})
export class StockSelectionComponent implements OnInit {
  stocks: Stock[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private stockService: StockService
  ) {}

  ngOnInit() {
    this.loadStocks();
  }

  loadStocks() {
    this.loading = true;
    this.error = null;
    
    // 首先检查API健康状态
    this.stockService.checkApiHealth().subscribe({
      next: (healthResponse) => {
        console.log('API健康检查通过:', healthResponse);
        
        // API健康，现在获取股票数据
        this.stockService.getAllStocks().subscribe({
          next: (response) => {
            console.log('股票数据响应:', response);
            if (response.success) {
              this.stocks = response.data.map((stock: any, index: number) => ({
                ...stock,
                selected: index === 0,
                featured: index === 0
              }));
              console.log('处理后的股票数据:', this.stocks);
            } else {
              this.error = '获取股票数据失败';
            }
            this.loading = false;
          },
          error: (err) => {
            console.error('获取股票数据错误:', err);
            this.error = `获取股票数据失败: ${err.message || err.status || '未知错误'}`;
            this.loading = false;
            this.useFallbackData();
          }
        });
      },
      error: (err) => {
        console.error('API健康检查失败:', err);
        this.error = `无法连接到服务器 (${err.status || '网络错误'})`;
        this.loading = false;
        this.useFallbackData();
      }
    });
  }

  useFallbackData() {
    console.log('使用备用数据');
    this.stocks = [
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 177.97, change: 2.4, selected: true, featured: true },
      { symbol: 'AAPL', name: 'Apple Inc.', price: 189.25, change: 0.8, selected: false },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2456.78, change: 1.5, selected: false },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 345.67, change: -0.5, selected: false }
    ];
  }

  toggleStock(stock: Stock) {
    stock.selected = !stock.selected;
  }

  getSelectedCount(): number {
    return this.stocks.filter(stock => stock.selected).length;
  }

  viewDetails(stock: Stock) {
    console.log('View details for', stock.symbol);
  }

  proceedToNext() {
    if (this.getSelectedCount() > 0) {
      this.router.navigate(['/strategy-selection']);
    }
  }
}

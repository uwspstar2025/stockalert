import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  selected: boolean;
  featured?: boolean;
}

@Component({
  selector: 'app-stock-selection',
  template: `
    <div class="container">
      <div class="header">
        <h1>选择要监控的股票</h1>
        <p>选择你想要监控交易的股票代码</p>
      </div>

      <div class="stocks-grid">
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

      <div class="action-section">
        <div class="selected-count">
          已选择 {{ getSelectedCount() }} 只股票
        </div>
        
        <button class="next-btn btn btn-primary" 
                [disabled]="getSelectedCount() === 0"
                (click)="proceedToNext()">
          下一步：设置监控系统
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./stock-selection.component.scss']
})
export class StockSelectionComponent implements OnInit {
  stocks: Stock[] = [
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 177.97, change: 2.4, selected: true, featured: true },
    { symbol: 'AVGO', name: 'Broadcom Inc.', price: 1234.56, change: -1.2, selected: false },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.25, change: 0.8, selected: false },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2456.78, change: 1.5, selected: false },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 345.67, change: -0.5, selected: false },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 456.89, change: 3.2, selected: false },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 123.45, change: -2.1, selected: false },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 234.56, change: -1.8, selected: false }
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

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
      this.router.navigate(['/tracking-system']);
    }
  }
}

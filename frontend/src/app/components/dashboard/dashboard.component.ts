import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { StockService } from '../../services/stock.service';
import { StrategyService, TradingStrategy } from '../../services/strategy.service';
import { NotificationService } from '../../services/notification.service';

interface DashboardStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  strategy?: TradingStrategy;
  alerts: StockAlert[];
  lastUpdate: Date;
}

interface StockAlert {
  type: 'buy' | 'sell' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  triggered: boolean;
}

interface PortfolioSummary {
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  activeStocks: number;
  activeStrategies: number;
  todaysTrades: number;
}

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1><i class="fa fa-tachometer-alt"></i> 股票追踪仪表盘</h1>
          <p>实时监控您的股票投资组合和交易策略</p>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-primary" (click)="refreshAll()">
            <i class="fa fa-sync" [class.fa-spin]="loading"></i> 刷新数据
          </button>
          <button class="btn btn-outline" (click)="navigateToStockSelection()">
            <i class="fa fa-plus"></i> 添加股票
          </button>
        </div>
      </div>

      <!-- Portfolio Summary -->
      <div class="portfolio-summary">
        <div class="summary-card total-value">
          <div class="card-icon">
            <i class="fa fa-wallet"></i>
          </div>
          <div class="card-content">
            <h3>总投资价值</h3>
            <div class="value">\${{ portfolioSummary.totalValue | number:'1.2-2' }}</div>
            <div class="change" [ngClass]="portfolioSummary.totalGain >= 0 ? 'positive' : 'negative'">
              {{ portfolioSummary.totalGain >= 0 ? '+' : '' }}\${{ portfolioSummary.totalGain | number:'1.2-2' }}
              ({{ portfolioSummary.totalGain >= 0 ? '+' : '' }}{{ portfolioSummary.totalGainPercent | number:'1.2-2' }}%)
            </div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">
            <i class="fa fa-chart-line"></i>
          </div>
          <div class="card-content">
            <h3>活跃股票</h3>
            <div class="value">{{ portfolioSummary.activeStocks }}</div>
            <div class="subtitle">只股票正在监控</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">
            <i class="fa fa-cogs"></i>
          </div>
          <div class="card-content">
            <h3>活跃策略</h3>
            <div class="value">{{ portfolioSummary.activeStrategies }}</div>
            <div class="subtitle">个策略正在运行</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">
            <i class="fa fa-exchange-alt"></i>
          </div>
          <div class="card-content">
            <h3>今日交易</h3>
            <div class="value">{{ portfolioSummary.todaysTrades }}</div>
            <div class="subtitle">笔策略触发</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2><i class="fa fa-bolt"></i> 快速操作</h2>
        <div class="actions-grid">
          <button class="action-card" (click)="navigateToStockSelection()">
            <i class="fa fa-search"></i>
            <h3>选择股票</h3>
            <p>添加新的股票到投资组合</p>
          </button>
          
          <button class="action-card" (click)="navigateToStrategySelection()">
            <i class="fa fa-cog"></i>
            <h3>配置策略</h3>
            <p>设置自动交易策略</p>
          </button>
          
          <button class="action-card" (click)="navigateToAlerts()">
            <i class="fa fa-bell"></i>
            <h3>查看提醒</h3>
            <p>管理价格和策略提醒</p>
          </button>
          
          <button class="action-card" (click)="navigateToAnalysis()">
            <i class="fa fa-chart-bar"></i>
            <h3>分析报告</h3>
            <p>查看投资表现分析</p>
          </button>
        </div>
      </div>

      <!-- Stock Tracking Section -->
      <div class="stock-tracking">
        <div class="section-header">
          <h2><i class="fa fa-eye"></i> 股票监控</h2>
          <div class="header-controls">
            <button class="btn btn-sm btn-outline" (click)="toggleAutoRefresh()">
              <i class="fa" [ngClass]="autoRefresh ? 'fa-pause' : 'fa-play'"></i>
              {{ autoRefresh ? '暂停' : '开启' }}自动刷新
            </button>
            <span class="last-update">最后更新: {{ lastUpdate | date:'HH:mm:ss' }}</span>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-section">
          <div class="loading-spinner">
            <i class="fa fa-spinner fa-spin"></i>
          </div>
          <p>正在获取最新股票数据...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="error-section">
          <div class="error-icon">
            <i class="fa fa-exclamation-triangle"></i>
          </div>
          <h3>数据获取失败</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" (click)="refreshAll()">
            <i class="fa fa-retry"></i> 重新加载
          </button>
        </div>

        <!-- Stock Cards -->
        <div *ngIf="!loading && !error" class="stocks-grid">
          <div class="stock-card" *ngFor="let stock of trackedStocks" [class.has-alerts]="stock.alerts.length > 0">
            <!-- Stock Header -->
            <div class="stock-header">
              <div class="stock-info">
                <h3>{{ stock.symbol }}</h3>
                <p class="company-name">{{ stock.name }}</p>
              </div>
              <div class="stock-actions">
                <button class="btn-icon" (click)="viewStockDetails(stock)" title="查看详情">
                  <i class="fa fa-info-circle"></i>
                </button>
                <button class="btn-icon" (click)="removeStock(stock)" title="移除监控">
                  <i class="fa fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Price Information -->
            <div class="price-section">
              <div class="current-price">
                <span class="price">\${{ stock.price | number:'1.2-2' }}</span>
                <span class="change" [ngClass]="stock.change >= 0 ? 'positive' : 'negative'">
                  {{ stock.change >= 0 ? '+' : '' }}{{ stock.change | number:'1.2-2' }}
                  ({{ stock.change >= 0 ? '+' : '' }}{{ stock.changePercent | number:'1.2-2' }}%)
                </span>
              </div>
              <div class="volume">
                <i class="fa fa-chart-bar"></i>
                成交量: {{ formatVolume(stock.volume) }}
              </div>
            </div>

            <!-- Strategy Information -->
            <div class="strategy-section" *ngIf="stock.strategy">
              <h4><i class="fa fa-cog"></i> 当前策略</h4>
              <div class="strategy-info">
                <span class="strategy-name">{{ stock.strategy.name }}</span>
                <span class="risk-level" [ngClass]="getRiskClass(stock.strategy.riskLevel)">
                  {{ stock.strategy.riskLevel }}风险
                </span>
              </div>
              
              <div class="strategy-triggers">
                <div class="trigger buy-trigger">
                  <span class="label">买入:</span>
                  <span class="value">{{ stock.strategy.buyTrigger }}</span>
                </div>
                <div class="trigger sell-trigger">
                  <span class="label">卖出:</span>
                  <span class="value">{{ stock.strategy.sellTrigger }}</span>
                </div>
              </div>
            </div>

            <!-- Alerts Section -->
            <div class="alerts-section" *ngIf="stock.alerts.length > 0">
              <h4><i class="fa fa-bell"></i> 当前提醒</h4>
              <div class="alerts-list">
                <div class="alert-item" *ngFor="let alert of stock.alerts" [ngClass]="'alert-' + alert.type">
                  <i class="fa" [ngClass]="getAlertIcon(alert.type)"></i>
                  <span class="alert-message">{{ alert.message }}</span>
                  <span class="alert-time">{{ alert.timestamp | date:'HH:mm' }}</span>
                </div>
              </div>
            </div>

            <!-- No Strategy Warning -->
            <div class="no-strategy-warning" *ngIf="!stock.strategy">
              <i class="fa fa-exclamation-triangle"></i>
              <span>未配置交易策略</span>
              <button class="btn btn-sm btn-primary" (click)="configureStrategy(stock)">
                <i class="fa fa-plus"></i> 配置策略
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="trackedStocks.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fa fa-chart-line"></i>
            </div>
            <h3>暂无监控股票</h3>
            <p>开始添加股票到您的投资组合，实时监控价格变动和交易机会。</p>
            <button class="btn btn-primary" (click)="navigateToStockSelection()">
              <i class="fa fa-plus"></i> 添加第一只股票
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2><i class="fa fa-history"></i> 最近活动</h2>
        <div class="activity-list">
          <div class="activity-item" *ngFor="let activity of recentActivities">
            <div class="activity-icon" [ngClass]="'activity-' + activity.type">
              <i class="fa" [ngClass]="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content">
              <span class="activity-message">{{ activity.message }}</span>
              <span class="activity-time">{{ activity.timestamp | date:'MM/dd HH:mm' }}</span>
            </div>
          </div>
          
          <div *ngIf="recentActivities.length === 0" class="no-activities">
            <i class="fa fa-clock"></i>
            <span>暂无最近活动</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  trackedStocks: DashboardStock[] = [];
  portfolioSummary: PortfolioSummary = {
    totalValue: 0,
    totalGain: 0,
    totalGainPercent: 0,
    activeStocks: 0,
    activeStrategies: 0,
    todaysTrades: 0
  };
  
  recentActivities: any[] = [];
  loading = true;
  error: string | null = null;
  lastUpdate = new Date();
  autoRefresh = true;
  
  private refreshSubscription?: Subscription;
  private refreshInterval = 30000; // 30 seconds

  constructor(
    private router: Router,
    private stockService: StockService,
    private strategyService: StrategyService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Load tracked stocks (from localStorage or API)
      await this.loadTrackedStocks();
      
      // Calculate portfolio summary
      this.calculatePortfolioSummary();
      
      // Load recent activities
      this.loadRecentActivities();
      
      this.lastUpdate = new Date();
      this.loading = false;
      
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      this.error = '加载仪表盘数据失败';
      this.loading = false;
    }
  }

  private async loadTrackedStocks(): Promise<void> {
    // Get selected stocks from localStorage
    const selectedStocksData = localStorage.getItem('selectedStocks');
    const selectedStrategies = localStorage.getItem('selectedStrategies');
    
    if (!selectedStocksData) {
      this.trackedStocks = [];
      return;
    }

    try {
      const selectedStocks = JSON.parse(selectedStocksData);
      const strategies = selectedStrategies ? JSON.parse(selectedStrategies) : {};
      
      // Get real-time data for selected stocks
      const response = await this.stockService.getAllStocks().toPromise();
      
      if (response.success) {
        this.trackedStocks = response.data
          .filter((stock: any) => selectedStocks.includes(stock.symbol))
          .map((stock: any) => ({
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.change,
            volume: stock.volume || 0,
            strategy: strategies[stock.symbol],
            alerts: this.generateAlertsForStock(stock, strategies[stock.symbol]),
            lastUpdate: new Date()
          }));
      }
    } catch (error) {
      console.error('Error loading tracked stocks:', error);
      // Use fallback data
      this.trackedStocks = this.getFallbackStocks();
    }
  }

  private getFallbackStocks(): DashboardStock[] {
    return [
      {
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        price: 315.35,
        change: 7.63,
        changePercent: 2.48,
        volume: 45000000,
        strategy: {
          id: '1',
          name: '动量交易策略',
          description: '基于技术指标的短期交易',
          category: '技术分析',
          riskLevel: '中等',
          expectedReturn: '15-25%',
          timeFrame: '1-3个月',
          minInvestment: 10000,
          buyTrigger: {
            type: 'price_change',
            value: 5,
            unit: '%',
            description: '上涨超过5%时买入'
          },
          sellTrigger: {
            type: 'price_change',
            value: -3,
            unit: '%',
            description: '下跌超过3%时卖出'
          },
          features: ['快速响应', '适合波动市场']
        },
        alerts: [
          {
            type: 'info',
            message: '价格接近买入触发点',
            timestamp: new Date(),
            triggered: false
          }
        ],
        lastUpdate: new Date()
      }
    ];
  }

  private generateAlertsForStock(stock: any, strategy?: TradingStrategy): StockAlert[] {
    const alerts: StockAlert[] = [];
    
    if (strategy) {
      // Generate strategy-based alerts
      if (stock.change > 5) {
        alerts.push({
          type: 'buy',
          message: '满足买入条件：涨幅超过5%',
          timestamp: new Date(),
          triggered: true
        });
      } else if (stock.change < -3) {
        alerts.push({
          type: 'sell',
          message: '满足卖出条件：跌幅超过3%',
          timestamp: new Date(),
          triggered: true
        });
      } else if (Math.abs(stock.change) > 2) {
        alerts.push({
          type: 'warning',
          message: '价格波动较大，建议关注',
          timestamp: new Date(),
          triggered: false
        });
      }
    }
    
    return alerts;
  }

  private calculatePortfolioSummary(): void {
    this.portfolioSummary.activeStocks = this.trackedStocks.length;
    this.portfolioSummary.activeStrategies = this.trackedStocks.filter(s => s.strategy).length;
    
    // Calculate total value and gains
    let totalValue = 0;
    let totalGain = 0;
    
    this.trackedStocks.forEach(stock => {
      // Assume 100 shares for demo
      const shares = 100;
      const value = stock.price * shares;
      const gain = (stock.change / 100) * value;
      
      totalValue += value;
      totalGain += gain;
    });
    
    this.portfolioSummary.totalValue = totalValue;
    this.portfolioSummary.totalGain = totalGain;
    this.portfolioSummary.totalGainPercent = totalValue > 0 ? (totalGain / totalValue) * 100 : 0;
    
    // Count today's trades (triggered alerts)
    this.portfolioSummary.todaysTrades = this.trackedStocks
      .reduce((count, stock) => count + stock.alerts.filter(a => a.triggered).length, 0);
  }

  private loadRecentActivities(): void {
    this.recentActivities = [
      {
        type: 'buy',
        message: 'TSLA 触发买入信号 - 价格上涨5.2%',
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        type: 'strategy',
        message: '为 AAPL 配置了新的交易策略',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        type: 'alert',
        message: 'GOOGL 价格提醒已触发',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];
  }

  private startAutoRefresh(): void {
    if (this.autoRefresh) {
      this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
        this.loadDashboardData();
      });
    }
  }

  private stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    
    if (this.autoRefresh) {
      this.startAutoRefresh();
      this.notificationService.showInfo('🔄 自动刷新已启用', '数据将每30秒自动更新');
    } else {
      this.stopAutoRefresh();
      this.notificationService.showInfo('⏸️ 自动刷新已暂停', '点击刷新按钮手动更新数据');
    }
  }

  refreshAll(): void {
    this.loadDashboardData();
    this.notificationService.showSuccess('🔄 数据已刷新', '仪表盘数据已更新到最新状态');
  }

  // Navigation methods
  navigateToStockSelection(): void {
    this.router.navigate(['/stock-selection']);
  }

  navigateToStrategySelection(): void {
    this.router.navigate(['/strategy-selection']);
  }

  navigateToAlerts(): void {
    this.router.navigate(['/alerts']);
  }

  navigateToAnalysis(): void {
    this.router.navigate(['/analysis']);
  }

  // Stock actions
  viewStockDetails(stock: DashboardStock): void {
    this.notificationService.showInfo(
      `📊 ${stock.symbol} 详细信息`,
      `当前价格: $${stock.price.toFixed(2)}, 涨跌: ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%`
    );
  }

  removeStock(stock: DashboardStock): void {
    const index = this.trackedStocks.findIndex(s => s.symbol === stock.symbol);
    if (index > -1) {
      this.trackedStocks.splice(index, 1);
      this.calculatePortfolioSummary();
      
      // Update localStorage
      const symbols = this.trackedStocks.map(s => s.symbol);
      localStorage.setItem('selectedStocks', JSON.stringify(symbols));
      
      this.notificationService.showWarning(
        '🗑️ 股票已移除',
        `${stock.symbol} (${stock.name}) 已从监控列表中移除`
      );
    }
  }

  configureStrategy(stock: DashboardStock): void {
    // Navigate to strategy selection with stock symbol
    localStorage.setItem('configureStrategyFor', stock.symbol);
    this.router.navigate(['/strategy-selection']);
  }

  // Utility methods
  formatVolume(volume: number): string {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
  }

  getRiskClass(riskLevel: string): string {
    const riskMap: { [key: string]: string } = {
      '极低': 'very-low',
      '低': 'low',
      '中等': 'medium',
      '中高': 'medium-high',
      '高': 'high',
      '极高': 'very-high'
    };
    return riskMap[riskLevel] || 'medium';
  }

  getAlertIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'buy': 'fa-arrow-up',
      'sell': 'fa-arrow-down',
      'warning': 'fa-exclamation-triangle',
      'info': 'fa-info-circle'
    };
    return iconMap[type] || 'fa-bell';
  }

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'buy': 'fa-shopping-cart',
      'sell': 'fa-hand-holding-usd',
      'strategy': 'fa-cog',
      'alert': 'fa-bell'
    };
    return iconMap[type] || 'fa-circle';
  }
}

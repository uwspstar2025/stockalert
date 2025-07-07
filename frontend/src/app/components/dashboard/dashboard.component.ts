import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { filter } from 'rxjs/operators';
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
          <button class="btn btn-outline" (click)="debugRefresh()">
            <i class="fa fa-bug"></i> 调试刷新
          </button>
          <button class="btn btn-outline" (click)="testFormatTrigger()">
            <i class="fa fa-bug"></i> 测试触发器
          </button>
          <button class="btn btn-outline" (click)="testCompleteFlow()">
            <i class="fa fa-flask"></i> 测试完整流程
          </button>
          <button class="btn btn-outline" (click)="testStrategyFlow()">
            <i class="fa fa-cog"></i> 测试策略
          </button>
          <button class="btn btn-outline btn-danger" (click)="clearAllTrackedStocks()" *ngIf="trackedStocks.length > 0">
            <i class="fa fa-trash"></i> 清除所有
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
                  <span class="value">{{ formatTrigger(stock.strategy.buyTrigger) }}</span>
                </div>
                <div class="trigger sell-trigger">
                  <span class="label">卖出:</span>
                  <span class="value">{{ formatTrigger(stock.strategy.sellTrigger) }}</span>
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
  private routerSubscription?: Subscription;
  private focusListener?: () => void;
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
    this.subscribeToRouterEvents();
    this.addWindowFocusListener();
    this.checkForRefreshFlag();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.removeWindowFocusListener();
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      console.log('=== LOADING DASHBOARD DATA ===');
      
      // Load tracked stocks (from localStorage or API)
      await this.loadTrackedStocks();
      
      // Calculate portfolio summary
      this.calculatePortfolioSummary();
      
      // Load recent activities
      this.loadRecentActivities();
      
      this.lastUpdate = new Date();
      this.loading = false;
      
      console.log('=== DASHBOARD DATA LOADED ===');
      console.log('Final tracked stocks count:', this.trackedStocks.length);
      console.log('Tracked stocks:', this.trackedStocks.map(s => ({ symbol: s.symbol, hasStrategy: !!s.strategy })));
      
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      this.error = '加载仪表盘数据失败';
      this.loading = false;
    }
  }

  private async loadTrackedStocks(): Promise<void> {
    // Get selected stocks from localStorage
    const selectedStocksData = localStorage.getItem('selectedStocks');
    const stockStrategyMapping = localStorage.getItem('stockStrategyMapping');
    const selectedStockData = localStorage.getItem('selectedStockData');
    
    console.log('Loading tracked stocks...');
    console.log('selectedStocksData:', selectedStocksData);
    console.log('stockStrategyMapping:', stockStrategyMapping);
    console.log('selectedStockData:', selectedStockData);
    
    if (!selectedStocksData) {
      this.trackedStocks = [];
      return;
    }

    try {
      const selectedStocks = JSON.parse(selectedStocksData);
      const strategies = stockStrategyMapping ? JSON.parse(stockStrategyMapping) : {};
      
      console.log('Parsed selectedStocks:', selectedStocks);
      console.log('Parsed strategies:', strategies);
      
      // Try to use saved stock data first, then fetch from API
      let stocksToProcess: any[] = [];
      
      if (selectedStockData) {
        // Use saved stock data
        stocksToProcess = JSON.parse(selectedStockData);
        console.log('Using saved stock data:', stocksToProcess);
      } else {
        // Fetch from API
        try {
          const response = await this.stockService.getAllStocks().toPromise();
          if (response.success) {
            stocksToProcess = response.data.filter((stock: any) => selectedStocks.includes(stock.symbol));
          }
        } catch (apiError) {
          console.warn('API failed, using fallback data:', apiError);
          // Use fallback data if API fails
          stocksToProcess = this.getFallbackStocks()
            .filter(stock => selectedStocks.includes(stock.symbol))
            .map(stock => ({
              symbol: stock.symbol,
              name: stock.name,
              price: stock.price,
              change: stock.changePercent,
              volume: stock.volume
            }));
        }
      }
      
      // Map to dashboard stock format
      this.trackedStocks = stocksToProcess.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change || 0,
        changePercent: stock.change || 0,
        volume: stock.volume || 0,
        strategy: strategies[stock.symbol],
        alerts: this.generateAlertsForStock(stock, strategies[stock.symbol]),
        lastUpdate: new Date()
      }));
      
      console.log('Final tracked stocks with strategies:', this.trackedStocks);
      console.log('Strategy mapping:', strategies);
      
    } catch (error) {
      console.error('Error loading tracked stocks:', error);
      // Use fallback data if everything fails
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

  debugRefresh(): void {
    console.log('=== DEBUG REFRESH ===');
    console.log('Current localStorage data:');
    console.log('selectedStocks:', localStorage.getItem('selectedStocks'));
    console.log('stockStrategyMapping:', localStorage.getItem('stockStrategyMapping'));
    console.log('selectedStockData:', localStorage.getItem('selectedStockData'));
    console.log('configureStrategyFor:', localStorage.getItem('configureStrategyFor'));
    console.log('selectedStrategy:', localStorage.getItem('selectedStrategy'));
    console.log('dashboardNeedsRefresh:', localStorage.getItem('dashboardNeedsRefresh'));
    
    // Parse and show the strategy mapping
    try {
      const strategyMapping = JSON.parse(localStorage.getItem('stockStrategyMapping') || '{}');
      console.log('Parsed strategy mapping:', strategyMapping);
      console.log('TSLA strategy:', strategyMapping['TSLA']);
    } catch (e) {
      console.log('Error parsing strategy mapping:', e);
    }
    
    this.loadDashboardData();
    
    console.log('After refresh - tracked stocks:', this.trackedStocks);
    console.log('TSLA tracked stock:', this.trackedStocks.find(s => s.symbol === 'TSLA'));
  }

  testStrategyFlow(): void {
    console.log('=== TESTING STRATEGY FLOW ===');
    
    // 1. Check if TSLA is in selected stocks
    const selectedStocks = JSON.parse(localStorage.getItem('selectedStocks') || '[]');
    console.log('Selected stocks:', selectedStocks);
    console.log('Is TSLA selected?', selectedStocks.includes('TSLA'));
    
    // 2. Check strategy mapping
    const strategyMapping = JSON.parse(localStorage.getItem('stockStrategyMapping') || '{}');
    console.log('Strategy mapping:', strategyMapping);
    console.log('TSLA strategy in mapping:', strategyMapping['TSLA']);
    
    // 3. Test setting a strategy for TSLA manually
    const testStrategy = {
      id: 'test-1',
      name: '测试策略',
      description: '测试用策略',
      category: '测试',
      riskLevel: '中等',
      expectedReturn: '10-15%',
      timeFrame: '1-3个月',
      minInvestment: 5000,
      buyTrigger: {
        type: 'price_change',
        value: 3,
        unit: '%',
        description: '上涨超过3%时买入'
      },
      sellTrigger: {
        type: 'price_change',
        value: -2,
        unit: '%',
        description: '下跌超过2%时卖出'
      },
      features: ['测试功能']
    };
    
    // 4. Manually set strategy for TSLA
    strategyMapping['TSLA'] = testStrategy;
    localStorage.setItem('stockStrategyMapping', JSON.stringify(strategyMapping));
    console.log('Manually set TSLA strategy:', testStrategy);
    
    // 5. Refresh dashboard
    this.loadDashboardData();
  }

  private subscribeToRouterEvents(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEvent = event as NavigationEnd;
        console.log('Router navigation event:', navEvent.url);
        // Refresh dashboard when navigating to dashboard
        if (navEvent.url === '/dashboard' || navEvent.url === '/') {
          console.log('Navigating to dashboard, checking for refresh...');
          // Check for refresh flag and refresh if needed
          this.checkForRefreshFlag();
        }
      });
  }

  private addWindowFocusListener(): void {
    this.focusListener = () => {
      // Check if we just returned from strategy selection
      if (this.router.url === '/dashboard') {
        console.log('Window focus detected on dashboard, refreshing...');
        setTimeout(() => {
          this.loadDashboardData();
        }, 100);
      }
    };
    window.addEventListener('focus', this.focusListener);
  }

  private removeWindowFocusListener(): void {
    if (this.focusListener) {
      window.removeEventListener('focus', this.focusListener);
    }
  }

  private checkForRefreshFlag(): void {
    const needsRefresh = localStorage.getItem('dashboardNeedsRefresh');
    if (needsRefresh === 'true') {
      console.log('Dashboard refresh flag detected, refreshing data...');
      localStorage.removeItem('dashboardNeedsRefresh');
      // Small delay to ensure all localStorage operations are complete
      setTimeout(() => {
        this.loadDashboardData();
      }, 100);
    }
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
    console.log('Configuring strategy for stock:', stock.symbol);
    localStorage.setItem('configureStrategyFor', stock.symbol);
    console.log('Set configureStrategyFor to:', stock.symbol);
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

  // Utility methods for managing tracked stocks
  clearAllTrackedStocks(): void {
    localStorage.removeItem('selectedStocks');
    localStorage.removeItem('selectedStockData');
    localStorage.removeItem('stockStrategyMapping');
    localStorage.removeItem('selectedStrategy');
    this.trackedStocks = [];
    this.calculatePortfolioSummary();
    
    this.notificationService.showInfo(
      '🗑️ 清除完成',
      '所有追踪的股票已清除'
    );
  }

  refreshTrackedStocks(): void {
    this.loadDashboardData();
    this.notificationService.showInfo(
      '🔄 数据刷新',
      '正在更新股票数据...'
    );
  }

  ensureTSLASelected(): void {
    console.log('=== ENSURING TSLA IS SELECTED ===');
    
    // Get current selected stocks
    let selectedStocks = JSON.parse(localStorage.getItem('selectedStocks') || '[]');
    console.log('Current selected stocks:', selectedStocks);
    
    // Add TSLA if not present
    if (!selectedStocks.includes('TSLA')) {
      selectedStocks.push('TSLA');
      localStorage.setItem('selectedStocks', JSON.stringify(selectedStocks));
      console.log('Added TSLA to selected stocks');
    }
    
    // Refresh dashboard
    this.loadDashboardData();
  }

  // Utility method to format trigger objects for display
  formatTrigger(trigger: any): string {
    if (!trigger) return '未设置';
    
    if (typeof trigger === 'string') {
      return trigger;
    }
    
    if (typeof trigger === 'object' && trigger.type && trigger.value !== undefined) {
      const value = trigger.value;
      const unit = trigger.unit || '';
      const description = trigger.description || '';
      
      // Format based on trigger type
      if (trigger.type === 'price_change') {
        return `价格变动 ${value >= 0 ? '+' : ''}${value}${unit}`;
      } else if (trigger.type === 'price_target') {
        return `目标价格 $${value}`;
      } else if (trigger.type === 'volume') {
        return `交易量 ${value}${unit}`;
      } else if (trigger.type === 'rsi') {
        return `RSI ${value}`;
      } else if (trigger.type === 'moving_average') {
        return `移动平均线 ${value}${unit}`;
      } else if (trigger.type === 'percentage') {
        return `${value}${unit}`;
      } else {
        // Fallback to description if available, otherwise show type and value
        return description || `${trigger.type}: ${value}${unit}`;
      }
    }
    
    // If it's an object but doesn't have expected structure, try to stringify it
    if (typeof trigger === 'object') {
      return JSON.stringify(trigger);
    }
    
    return '未知触发条件';
  }

  // Test method to verify the formatTrigger function
  testFormatTrigger(): void {
    console.log('=== TESTING formatTrigger METHOD ===');
    
    const testTriggers = [
      { type: 'price_change', value: 5, unit: '%', description: '价格上涨超过5%时买入' },
      { type: 'price_change', value: -3, unit: '%', description: '价格下跌超过3%时卖出' },
      { type: 'price_target', value: 350, unit: '', description: '目标价格$350' },
      { type: 'rsi', value: 70, unit: '', description: 'RSI超过70' },
      'Simple string trigger',
      null,
      undefined,
      { randomObject: true }
    ];
    
    testTriggers.forEach((trigger, index) => {
      console.log(`Test ${index + 1}:`, trigger, '→', this.formatTrigger(trigger));
    });
  }

  // Test method to simulate complete strategy configuration flow
  testCompleteFlow(): void {
    console.log('=== TESTING COMPLETE STRATEGY FLOW ===');
    
    // Clear existing data
    localStorage.removeItem('selectedStocks');
    localStorage.removeItem('stockStrategyMapping');
    localStorage.removeItem('selectedStrategy');
    localStorage.removeItem('configureStrategyFor');
    
    // Set up TSLA as selected stock
    localStorage.setItem('selectedStocks', JSON.stringify(['TSLA']));
    console.log('✓ Added TSLA to selected stocks');
    
    // Create a complete strategy object
    const testStrategy = {
      id: 'test-classic-4-20',
      name: '经典4%-20%策略',
      description: '稳健型策略，适合中长期投资',
      category: '稳健型',
      riskLevel: '低',
      expectedReturn: '15-25%',
      timeFrame: '3-6个月',
      minInvestment: 1000,
      buyTrigger: {
        type: 'price_change',
        value: -4,
        unit: '%',
        description: '当股价下跌4%时买入'
      },
      sellTrigger: {
        type: 'price_change',
        value: 20,
        unit: '%',
        description: '当股价上涨20%时卖出'
      },
      features: ['风险较低', '适合新手', '长期持有']
    };
    
    // Configure strategy for TSLA
    const strategyMapping = { 'TSLA': testStrategy };
    localStorage.setItem('stockStrategyMapping', JSON.stringify(strategyMapping));
    localStorage.setItem('selectedStrategy', JSON.stringify(testStrategy));
    
    console.log('✓ Strategy configured for TSLA:', testStrategy);
    console.log('✓ Strategy mapping saved:', strategyMapping);
    
    // Set up stock data
    const stockData = [{
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 292.55,
      change: -7.23,
      changePercent: -7.23,
      volume: 85000000
    }];
    localStorage.setItem('selectedStockData', JSON.stringify(stockData));
    
    // Refresh dashboard
    this.loadDashboardData();
    
    console.log('✓ Dashboard refreshed');
    console.log('✓ Check the dashboard - TSLA should now show strategy details');
    
    this.notificationService.showSuccess(
      '🧪 测试完成',
      'TSLA 策略已配置，请检查仪表盘显示'
    );
  }
}

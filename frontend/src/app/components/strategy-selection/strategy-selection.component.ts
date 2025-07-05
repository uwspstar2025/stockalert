import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StrategyService, TradingStrategy, BacktestData } from '../../services/strategy.service';

@Component({
  selector: 'app-strategy-selection',
  template: `
    <div class="container">
      <div class="header">
        <h1>选择交易策略</h1>
        <p>根据您的投资风格选择最适合的交易策略</p>
      </div>

      <!-- 筛选器 -->
      <div class="filters-section">
        <div class="filter-group">
          <label>策略分类:</label>
          <select [(ngModel)]="selectedCategory" (change)="filterStrategies()">
            <option value="">全部分类</option>
            <option *ngFor="let category of categories" [value]="category">{{category}}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>风险级别:</label>
          <select [(ngModel)]="selectedRiskLevel" (change)="filterStrategies()">
            <option value="">全部级别</option>
            <option *ngFor="let risk of riskLevels" [value]="risk">{{risk}}</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>
            <input type="checkbox" [(ngModel)]="showPopularOnly" (change)="filterStrategies()">
            只显示热门策略
          </label>
        </div>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner">⟳</div>
        <p>正在加载交易策略...</p>
      </div>

      <!-- 错误状态 -->
      <div *ngIf="error && !loading" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>{{ error }}</h3>
        <button class="btn btn-primary" (click)="loadStrategies()">重试</button>
      </div>

      <!-- 策略网格 -->
      <div *ngIf="!loading && !error" class="strategies-grid">
        <div class="strategy-card" 
             *ngFor="let strategy of filteredStrategies"
             [class.selected]="selectedStrategy?.id === strategy.id"
             [class.popular]="strategy.popular"
             [class.advanced]="strategy.advanced"
             (click)="selectStrategy(strategy)">
          
          <!-- 标签 -->
          <div class="strategy-badges">
            <span *ngIf="strategy.popular" class="badge popular">🔥 热门</span>
            <span *ngIf="strategy.advanced" class="badge advanced">⚡ 专业</span>
            <span class="badge risk" [class]="'risk-' + getRiskClass(strategy.riskLevel)">
              {{strategy.riskLevel}}风险
            </span>
          </div>
          
          <div class="strategy-header">
            <h3>{{ strategy.name }}</h3>
            <p class="category">{{ strategy.category }}</p>
            <p class="description">{{ strategy.description }}</p>
          </div>
          
          <div class="strategy-triggers">
            <div class="trigger buy-trigger">
              <span class="label">买入:</span>
              <span class="value">{{ strategy.buyTrigger.description }}</span>
            </div>
            <div class="trigger sell-trigger">
              <span class="label">卖出:</span>
              <span class="value">{{ strategy.sellTrigger.description }}</span>
            </div>
          </div>
          
          <div class="strategy-metrics">
            <div class="metric">
              <span class="label">预期收益:</span>
              <span class="value success">{{ strategy.expectedReturn }}</span>
            </div>
            <div class="metric">
              <span class="label">时间周期:</span>
              <span class="value">{{ strategy.timeFrame }}</span>
            </div>
            <div class="metric">
              <span class="label">最低投资:</span>
              <span class="value">¥{{ strategy.minInvestment.toLocaleString() }}</span>
            </div>
          </div>
          
          <div class="strategy-features">
            <span *ngFor="let feature of strategy.features" class="feature-tag">
              {{ feature }}
            </span>
          </div>
          
          <div class="strategy-actions">
            <button class="btn btn-outline" (click)="viewBacktest(strategy); $event.stopPropagation()">
              回测数据
            </button>
            <button *ngIf="selectedStrategy?.id === strategy.id" class="btn btn-primary">
              ✓ 已选择
            </button>
          </div>
        </div>
      </div>

      <!-- 选择确认 -->
      <div *ngIf="selectedStrategy && !loading" class="selection-summary">
        <div class="summary-content">
          <h3>已选择策略: {{ selectedStrategy?.name }}</h3>
          <p>{{ selectedStrategy?.description }}</p>
          <div class="summary-metrics">
            <span>风险级别: {{ selectedStrategy?.riskLevel }}</span>
            <span>预期收益: {{ selectedStrategy?.expectedReturn }}</span>
            <span>投资周期: {{ selectedStrategy?.timeFrame }}</span>
          </div>
        </div>
        <button class="btn btn-primary btn-large" (click)="proceedWithStrategy()">
          使用此策略 →
        </button>
      </div>

      <!-- 回测数据弹窗 -->
      <div *ngIf="showBacktest" class="backtest-modal" (click)="closeBacktest()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ backtestStrategy?.name }} - 回测数据</h3>
            <button class="close-btn" (click)="closeBacktest()">×</button>
          </div>
          <div *ngIf="backtestLoading" class="loading-spinner">⟳</div>
          <div *ngIf="backtestData && !backtestLoading" class="backtest-content">
            <div class="backtest-grid">
              <div class="backtest-metric">
                <span class="label">回测周期</span>
                <span class="value">{{ backtestData?.period }}</span>
              </div>
              <div class="backtest-metric">
                <span class="label">总交易次数</span>
                <span class="value">{{ backtestData?.totalTrades }}次</span>
              </div>
              <div class="backtest-metric">
                <span class="label">胜率</span>
                <span class="value success">{{ backtestData?.winRate }}</span>
              </div>
              <div class="backtest-metric">
                <span class="label">总收益率</span>
                <span class="value success">{{ backtestData?.totalReturn }}</span>
              </div>
              <div class="backtest-metric">
                <span class="label">最大回撤</span>
                <span class="value warning">{{ backtestData?.maxDrawdown }}</span>
              </div>
              <div class="backtest-metric">
                <span class="label">夏普比率</span>
                <span class="value">{{ backtestData?.sharpeRatio }}</span>
              </div>
              <div class="backtest-metric">
                <span class="label">平均持仓天数</span>
                <span class="value">{{ backtestData?.avgHoldingDays }}天</span>
              </div>
              <div class="backtest-metric">
                <span class="label">盈利因子</span>
                <span class="value">{{ backtestData?.profitFactor }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./strategy-selection.component.scss']
})
export class StrategySelectionComponent implements OnInit {
  strategies: TradingStrategy[] = [];
  filteredStrategies: TradingStrategy[] = [];
  categories: string[] = [];
  riskLevels: string[] = [];
  
  selectedStrategy: TradingStrategy | null = null;
  selectedCategory = '';
  selectedRiskLevel = '';
  showPopularOnly = false;
  
  loading = true;
  error: string | null = null;
  
  // 回测数据
  showBacktest = false;
  backtestStrategy: TradingStrategy | null = null;
  backtestData: BacktestData | null = null;
  backtestLoading = false;

  constructor(
    private router: Router,
    private strategyService: StrategyService
  ) {}

  ngOnInit() {
    this.loadStrategies();
    this.loadCategories();
  }

  loadStrategies() {
    this.loading = true;
    this.error = null;
    
    this.strategyService.getAllStrategies().subscribe({
      next: (response) => {
        if (response.success) {
          this.strategies = response.data;
          this.filteredStrategies = [...this.strategies];
        } else {
          this.error = '获取策略数据失败';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading strategies:', err);
        this.error = '获取交易策略失败，请检查网络连接';
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.strategyService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data.categories;
          this.riskLevels = response.data.riskLevels;
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  filterStrategies() {
    this.filteredStrategies = this.strategies.filter(strategy => {
      const categoryMatch = !this.selectedCategory || strategy.category === this.selectedCategory;
      const riskMatch = !this.selectedRiskLevel || strategy.riskLevel === this.selectedRiskLevel;
      const popularMatch = !this.showPopularOnly || strategy.popular;
      
      return categoryMatch && riskMatch && popularMatch;
    });
  }

  selectStrategy(strategy: TradingStrategy) {
    this.selectedStrategy = strategy;
    this.strategyService.selectStrategy(strategy);
  }

  getRiskClass(riskLevel: string): string {
    const riskMap: { [key: string]: string } = {
      '极低': 'very-low',
      '低': 'low', 
      '中': 'medium',
      '中高': 'medium-high',
      '高': 'high',
      '极高': 'very-high'
    };
    return riskMap[riskLevel] || 'medium';
  }

  viewBacktest(strategy: TradingStrategy) {
    this.backtestStrategy = strategy;
    this.showBacktest = true;
    this.backtestLoading = true;
    
    this.strategyService.getBacktestData(strategy.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.backtestData = response.data;
        }
        this.backtestLoading = false;
      },
      error: (err) => {
        console.error('Error loading backtest data:', err);
        this.backtestLoading = false;
      }
    });
  }

  closeBacktest() {
    this.showBacktest = false;
    this.backtestStrategy = null;
    this.backtestData = null;
  }

  proceedWithStrategy() {
    if (this.selectedStrategy) {
      // 导航到追踪系统，携带选择的策略
      this.router.navigate(['/tracking-system'], {
        queryParams: { strategy: this.selectedStrategy.id }
      });
    }
  }
}

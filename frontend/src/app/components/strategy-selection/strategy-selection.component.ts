import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StrategyService, TradingStrategy, BacktestData } from '../../services/strategy.service';
import { NotificationService } from '../../services/notification.service';

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
            <div class="strategy-title-line">
              <h3>{{ strategy.name }}</h3>
              <button class="help-icon-inline" 
                      (click)="showStrategyHelp(strategy); $event.stopPropagation()" 
                      title="查看策略详细说明">
                <i class="fa fa-question-circle"></i>
              </button>
            </div>
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

      <!-- 策略帮助弹窗 -->
      <div *ngIf="showStrategyHelpModal" class="help-modal" (click)="closeStrategyHelp()">
        <div class="modal-content help-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ helpStrategy?.name }} - 策略详解</h3>
            <button class="close-btn" (click)="closeStrategyHelp()">×</button>
          </div>
          <div *ngIf="helpStrategy" class="help-details">
            <!-- 策略概述 -->
            <div class="help-section">
              <h4><i class="fa fa-info-circle"></i> 策略概述</h4>
              <p>{{ getStrategyOverview(helpStrategy) }}</p>
            </div>
            
            <!-- 适用场景 -->
            <div class="help-section">
              <h4><i class="fa fa-target"></i> 适用场景</h4>
              <ul>
                <li *ngFor="let scenario of getStrategyScenarios(helpStrategy)">{{ scenario }}</li>
              </ul>
            </div>
            
            <!-- 操作原理 -->
            <div class="help-section">
              <h4><i class="fa fa-cogs"></i> 操作原理</h4>
              <div class="principle-steps">
                <div class="step buy-step">
                  <div class="step-icon buy">买入</div>
                  <div class="step-content">
                    <strong>买入条件:</strong> {{ helpStrategy.buyTrigger.description }}
                    <br><strong>操作说明:</strong> {{ getStrategyBuyExplanation(helpStrategy) }}
                  </div>
                </div>
                <div class="step sell-step">
                  <div class="step-icon sell">卖出</div>
                  <div class="step-content">
                    <strong>卖出条件:</strong> {{ helpStrategy.sellTrigger.description }}
                    <br><strong>操作说明:</strong> {{ getStrategySellExplanation(helpStrategy) }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 风险提示 -->
            <div class="help-section">
              <h4><i class="fa fa-exclamation-triangle"></i> 风险提示</h4>
              <div class="risk-warning">
                <ul>
                  <li *ngFor="let risk of getStrategyRisks(helpStrategy)">{{ risk }}</li>
                </ul>
              </div>
            </div>
            
            <!-- 实战建议 -->
            <div class="help-section">
              <h4><i class="fa fa-lightbulb-o"></i> 实战建议</h4>
              <ul>
                <li *ngFor="let tip of getStrategyTips(helpStrategy)">{{ tip }}</li>
              </ul>
            </div>
            
            <!-- 策略参数 -->
            <div class="help-section">
              <h4><i class="fa fa-sliders"></i> 关键参数</h4>
              <div class="parameters-grid">
                <div class="param-item">
                  <span class="param-label">最低投资额:</span>
                  <span class="param-value">¥{{ helpStrategy.minInvestment.toLocaleString() }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">建议持有周期:</span>
                  <span class="param-value">{{ helpStrategy.timeFrame }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">风险等级:</span>
                  <span class="param-value risk-{{ getRiskClass(helpStrategy.riskLevel) }}">{{ helpStrategy.riskLevel }}风险</span>
                </div>
                <div class="param-item">
                  <span class="param-label">预期收益:</span>
                  <span class="param-value success">{{ helpStrategy.expectedReturn }}</span>
                </div>
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

  // 策略帮助
  showStrategyHelpModal = false;
  helpStrategy: TradingStrategy | null = null;

  constructor(
    private router: Router,
    private strategyService: StrategyService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadStrategies();
    this.loadCategories();
    
    // Load previously selected strategy after strategies are loaded
    setTimeout(() => this.loadSelectedStrategy(), 100);
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
    
    // Show notification when strategy is selected
    this.notificationService.showSuccess(
      '🎯 策略已选择',
      `${strategy.name} 策略已配置，风险级别：${strategy.riskLevel}`
    );
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
      // Save selected strategy to localStorage
      this.saveSelectedStrategy();
      
      // Show success notification
      this.notificationService.showSuccess(
        '🎯 策略配置完成',
        `已选择 "${this.selectedStrategy.name}" 策略，开始监控您的投资组合`
      );
      
      // Navigate back to dashboard to see tracked stocks
      this.router.navigate(['/dashboard']);
    } else {
      this.notificationService.showWarning(
        '⚠️ 请选择策略',
        '请选择一个交易策略才能开始监控'
      );
    }
  }

  private saveSelectedStrategy(): void {
    if (this.selectedStrategy) {
      // Get currently selected stocks
      const selectedStocks = JSON.parse(localStorage.getItem('selectedStocks') || '[]');
      
      // Save strategy mapping for each selected stock
      const strategyMapping: { [key: string]: any } = {};
      selectedStocks.forEach((symbol: string) => {
        strategyMapping[symbol] = this.selectedStrategy;
      });
      
      // Save to localStorage
      localStorage.setItem('selectedStrategy', JSON.stringify(this.selectedStrategy));
      localStorage.setItem('stockStrategyMapping', JSON.stringify(strategyMapping));
      
      console.log('Strategy saved:', this.selectedStrategy);
      console.log('Strategy mapping saved:', strategyMapping);
    }
  }

  private loadSelectedStrategy(): void {
    try {
      const saved = localStorage.getItem('selectedStrategy');
      if (saved) {
        const strategy = JSON.parse(saved);
        // Find and select the previously chosen strategy
        const foundStrategy = this.strategies.find(s => s.id === strategy.id);
        if (foundStrategy) {
          this.selectedStrategy = foundStrategy;
        }
      }
    } catch (error) {
      console.warn('Failed to load selected strategy:', error);
    }
  }

  // 策略帮助相关方法
  showStrategyHelp(strategy: TradingStrategy) {
    this.helpStrategy = strategy;
    this.showStrategyHelpModal = true;
  }

  closeStrategyHelp() {
    this.showStrategyHelpModal = false;
    this.helpStrategy = null;
  }

  getStrategyOverview(strategy: TradingStrategy): string {
    const overviews: { [key: string]: string } = {
      '经典4%-20%策略': '这是一个稳健型的中长期投资策略，基于股价波动进行分批建仓和减仓。当股价下跌4%时买入，上涨20%时卖出，适合风险偏好较低的投资者。',
      '趋势跟踪策略': '基于技术指标识别股价趋势，在上升趋势中持有，在下降趋势中退出。适合有一定技术分析基础的投资者。',
      '均值回归策略': '基于股价会回归其历史平均值的理论，在股价偏离均值较大时进行反向操作。',
      '动量交易策略': '跟随股价动量进行交易，在强势股票中寻找机会，适合短期交易。',
      '价值投资策略': '基于公司基本面分析，寻找被低估的优质股票进行长期持有。'
    };
    return overviews[strategy.name] || '这是一个专业的量化交易策略，基于历史数据和技术指标进行买卖决策。';
  }

  getStrategyScenarios(strategy: TradingStrategy): string[] {
    const scenarios: { [key: string]: string[] } = {
      '经典4%-20%策略': [
        '适合震荡市场，股价在一定区间内波动',
        '投资者风险承受能力较低，追求稳健收益',
        '有充足的资金进行分批建仓',
        '不适合单边下跌或暴涨的极端市场'
      ],
      '趋势跟踪策略': [
        '适合趋势明显的市场环境',
        '投资者能够承受一定的回撤',
        '有时间关注市场变化',
        '适合中长期投资'
      ],
      '均值回归策略': [
        '适合价格波动较大的股票',
        '市场处于相对稳定期',
        '投资者有耐心等待价格回归',
        '适合有一定投资经验的用户'
      ],
      '动量交易策略': [
        '适合活跃的交易者',
        '市场流动性充足',
        '能够及时响应市场变化',
        '适合短期交易机会'
      ],
      '价值投资策略': [
        '适合长期投资者',
        '有能力进行基本面分析',
        '资金充足，不急于变现',
        '适合被低估的优质股票'
      ]
    };
    return scenarios[strategy.name] || ['适合有经验的投资者', '需要对市场有深入了解', '建议小额试验后再加大投入'];
  }

  getStrategyBuyExplanation(strategy: TradingStrategy): string {
    const explanations: { [key: string]: string } = {
      '经典4%-20%策略': '当股价相对于上次买入价格下跌4%时，系统会自动提醒买入。建议分批买入，每次买入金额不超过总资金的20%。',
      '趋势跟踪策略': '当技术指标确认上升趋势时买入，通常结合移动平均线、MACD等指标判断。',
      '均值回归策略': '当股价偏离历史均值2个标准差以上时买入，预期价格会回归均值。',
      '动量交易策略': '当股价突破阻力位或成交量放大时买入，跟随强势动量。',
      '价值投资策略': '当股票估值低于内在价值时买入，需要结合PE、PB等估值指标。'
    };
    return explanations[strategy.name] || '根据策略信号提示进行买入操作。';
  }

  getStrategySellExplanation(strategy: TradingStrategy): string {
    const explanations: { [key: string]: string } = {
      '经典4%-20%策略': '当股价相对于买入价格上涨20%时卖出，实现稳健收益。如果继续上涨，可以保留部分仓位。',
      '趋势跟踪策略': '当趋势反转信号出现时卖出，避免在下跌趋势中持有。',
      '均值回归策略': '当股价回归到均值附近或超出均值时卖出，获得回归收益。',
      '动量交易策略': '当动量减弱或出现反转信号时及时卖出，控制风险。',
      '价值投资策略': '当股价达到或超过内在价值时考虑卖出，或者基本面恶化时止损。'
    };
    return explanations[strategy.name] || '根据策略信号提示进行卖出操作。';
  }

  getStrategyRisks(strategy: TradingStrategy): string[] {
    const risks: { [key: string]: string[] } = {
      '经典4%-20%策略': [
        '在单边下跌市场中可能面临连续买入而股价持续下跌的风险',
        '需要充足的资金支持分批买入策略',
        '在震荡市场中可能频繁交易产生较高手续费',
        '错过强势股票的大幅上涨机会'
      ],
      '趋势跟踪策略': [
        '在震荡市场中容易产生虚假信号',
        '趋势反转时可能面临较大回撤',
        '需要及时止损，对执行力要求较高',
        '错过反转初期的机会'
      ],
      '均值回归策略': [
        '股价可能长期偏离均值不回归',
        '市场结构性变化可能导致均值失效',
        '需要较强的风险承受能力',
        '时机把握困难'
      ],
      '动量交易策略': [
        '市场波动剧烈，风险较高',
        '需要频繁交易，手续费较高',
        '对时机要求极高',
        '容易受情绪影响做出错误决策'
      ],
      '价值投资策略': [
        '需要较长时间才能见效',
        '可能遇到价值陷阱',
        '市场情绪影响较大',
        '需要较强的基本面分析能力'
      ]
    };
    return risks[strategy.name] || ['投资有风险，请谨慎操作', '建议先小额试验', '密切关注市场变化'];
  }

  getStrategyTips(strategy: TradingStrategy): string[] {
    const tips: { [key: string]: string[] } = {
      '经典4%-20%策略': [
        '建议预留足够的现金进行分批买入',
        '选择基本面较好的优质股票',
        '严格执行买卖纪律，不要情绪化交易',
        '定期回顾和调整策略参数',
        '关注公司基本面变化，避免踩雷'
      ],
      '趋势跟踪策略': [
        '学习基本的技术分析知识',
        '设置合理的止损点位',
        '避免在震荡市场中使用',
        '结合基本面分析提高成功率',
        '保持冷静，避免追涨杀跌'
      ],
      '均值回归策略': [
        '深入研究股票的历史价格规律',
        '关注市场整体环境变化',
        '设置合理的止损和止盈点',
        '分散投资降低单一股票风险',
        '耐心等待回归机会'
      ],
      '动量交易策略': [
        '密切关注市场热点和板块轮动',
        '严格控制仓位，避免重仓操作',
        '快进快出，不要恋战',
        '提高交易技巧和反应速度',
        '做好心理准备应对波动'
      ],
      '价值投资策略': [
        '深入学习财务报表分析',
        '关注行业发展趋势',
        '建立自己的投资研究体系',
        '保持长期投资心态',
        '定期评估投资组合'
      ]
    };
    return tips[strategy.name] || ['建议先学习相关知识', '小额试验积累经验', '保持良好的投资心态'];
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { NotificationService } from '../../services/notification.service';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  selected: boolean;
  featured?: boolean;
  volume?: number;
  category?: string;
}

@Component({
  selector: 'app-stock-selection',
  template: `
    <div class="container">
      <div class="header">
        <h1>选择要监控的股票</h1>
        <p>选择你想要监控交易的股票代码，开始你的智能投资之旅</p>
      </div>

      <!-- 搜索和过滤器 -->
      <div *ngIf="!loading && !error" class="filters-section">
        <div class="filter-group">
          <label>🔍 搜索股票</label>
          <input type="text" 
                 [(ngModel)]="searchTerm" 
                 placeholder="输入股票代码或公司名称..."
                 (input)="filterStocks()">
        </div>
        <div class="filter-group">
          <label>📊 市场类型</label>
          <select [(ngModel)]="selectedMarket" (change)="filterStocks()">
            <option value="">全部市场</option>
            <option value="tech">科技股</option>
            <option value="finance">金融股</option>
            <option value="energy">能源股</option>
          </select>
        </div>
        <div class="filter-group">
          <label>
            <input type="checkbox" [(ngModel)]="showOnlySelected" (change)="filterStocks()">
            只显示已选股票
          </label>
        </div>
      </div>

      <!-- 加载状态 -->
      <div *ngIf="loading" class="loading-state">
        <div class="loading-spinner">⟳</div>
        <h3>正在加载股票数据...</h3>
        <p>正在从市场获取最新数据，请稍候...</p>
      </div>

      <!-- 错误状态 -->
      <div *ngIf="error && !loading" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>{{ error }}</h3>
        <p>请检查网络连接或稍后重试</p>
        <button class="btn btn-primary" (click)="loadStocks()">🔄 重新加载</button>
      </div>

      <!-- 股票网格 -->
      <div *ngIf="!loading && !error" class="stocks-grid">
        <div class="stock-card" 
             *ngFor="let stock of filteredStocks"
             [class.selected]="stock.selected"
             [class.featured]="stock.featured"
             [class.tech]="stock.category === 'tech'"
             [class.finance]="stock.category === 'finance'"
             [class.energy]="stock.category === 'energy'"
             (click)="toggleStock(stock)">
          
          <!-- 股票标签 -->
          <div class="stock-badges" *ngIf="stock.featured || stock.category">
            <span class="badge featured" *ngIf="stock.featured">⭐ 推荐</span>
            <span class="badge category" [ngClass]="'category-' + stock.category" *ngIf="stock.category">
              {{ getCategoryName(stock.category) }}
            </span>
          </div>
          
          <div class="stock-header">
            <div class="stock-info">
              <h3>{{ stock.symbol }}</h3>
              <p class="company-name">{{ stock.name }}</p>
              <p class="market-info" *ngIf="stock.volume">
                <span class="volume">成交量: {{ formatVolume(stock.volume) }}</span>
              </p>
            </div>
            
            <div class="selection-indicator" [class.selected]="stock.selected">
              <div class="checkbox-custom">
                <span *ngIf="stock.selected">✓</span>
              </div>
            </div>
          </div>
          
          <div class="stock-metrics">
            <div class="metric price-metric">
              <span class="label">当前价格</span>
              <span class="value price">\${{ stock.price.toFixed(2) }}</span>
            </div>
            <div class="metric change-metric">
              <span class="label">涨跌幅</span>
              <span class="value change" [ngClass]="stock.change >= 0 ? 'positive' : 'negative'">
                {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
              </span>
            </div>
          </div>
          
          <div class="stock-actions">
            <button class="btn btn-outline details-btn" 
                    (click)="viewDetails(stock); $event.stopPropagation()">
              📈 查看详情
            </button>
          </div>
        </div>
      </div>

      <!-- 选择汇总 -->
      <div *ngIf="!loading && !error && getSelectedCount() > 0" class="selection-summary">
        <div class="summary-content">
          <h3>📋 已选择 {{ getSelectedCount() }} 只股票</h3>
          <p>你已选择了 {{ getSelectedCount() }} 只股票进行监控和交易</p>
          <div class="summary-metrics">
            <span>总价值: \${{ getTotalValue().toFixed(2) }}</span>
            <span>平均涨跌: {{ getAverageChange().toFixed(2) }}%</span>
          </div>
        </div>
        
        <button class="btn btn-primary btn-large" 
                (click)="proceedToNext()">
          🚀 下一步：选择交易策略
        </button>
      </div>

      <!-- 股票详情弹窗 -->
      <div *ngIf="showStockDetailsModal" class="stock-details-modal" (click)="closeStockDetails()">
        <div class="modal-content stock-details-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ selectedStockDetails?.symbol }} - 股票详情</h3>
            <button class="close-btn" (click)="closeStockDetails()">×</button>
          </div>
          
          <div *ngIf="selectedStockDetails" class="stock-details-body">
            <!-- 基本信息 -->
            <div class="details-section">
              <h4><i class="fa fa-info-circle"></i> 基本信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">公司名称</span>
                  <span class="info-value">{{ selectedStockDetails.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">股票代码</span>
                  <span class="info-value">{{ selectedStockDetails.symbol }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">当前价格</span>
                  <span class="info-value price">\${{ selectedStockDetails.price.toFixed(2) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">涨跌幅</span>
                  <span class="info-value" [ngClass]="selectedStockDetails.change >= 0 ? 'positive' : 'negative'">
                    {{ selectedStockDetails.change >= 0 ? '+' : '' }}{{ selectedStockDetails.change.toFixed(2) }}%
                  </span>
                </div>
                <div class="info-item" *ngIf="selectedStockDetails.volume">
                  <span class="info-label">成交量</span>
                  <span class="info-value">{{ selectedStockDetails.volume.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- 市场表现 -->
            <div class="details-section">
              <h4><i class="fa fa-chart-line"></i> 市场表现</h4>
              <div class="performance-metrics">
                <div class="metric-card">
                  <div class="metric-icon positive">📈</div>
                  <div class="metric-info">
                    <span class="metric-label">今日表现</span>
                    <span class="metric-value" [ngClass]="selectedStockDetails.change >= 0 ? 'positive' : 'negative'">
                      {{ selectedStockDetails.change >= 0 ? '+' : '' }}{{ selectedStockDetails.change.toFixed(2) }}%
                    </span>
                  </div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-icon">💰</div>
                  <div class="metric-info">
                    <span class="metric-label">市场价值</span>
                    <span class="metric-value">\${{ selectedStockDetails.price.toFixed(2) }}</span>
                  </div>
                </div>
                
                <div class="metric-card" *ngIf="selectedStockDetails.volume">
                  <div class="metric-icon">📊</div>
                  <div class="metric-info">
                    <span class="metric-label">交易活跃度</span>
                    <span class="metric-value">{{ getVolumeStatus(selectedStockDetails.volume) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 投资建议 -->
            <div class="details-section">
              <h4><i class="fa fa-lightbulb"></i> 投资建议</h4>
              <div class="investment-advice">
                <div class="advice-card" [ngClass]="getInvestmentRating(selectedStockDetails)">
                  <div class="advice-header">
                    <span class="advice-rating">{{ getInvestmentRatingText(selectedStockDetails) }}</span>
                    <span class="advice-icon">{{ getInvestmentIcon(selectedStockDetails) }}</span>
                  </div>
                  <p class="advice-description">{{ getInvestmentAdvice(selectedStockDetails) }}</p>
                </div>
              </div>
            </div>

            <!-- 快速操作 -->
            <div class="details-section">
              <h4><i class="fa fa-rocket"></i> 快速操作</h4>
              <div class="quick-actions">
                <button class="btn btn-primary action-btn" (click)="addToWatchlist(selectedStockDetails)">
                  <i class="fa fa-eye"></i> 添加到监控
                </button>
                <button class="btn btn-success action-btn" (click)="selectForTrading(selectedStockDetails)">
                  <i class="fa fa-plus"></i> 选择交易
                </button>
                <button class="btn btn-outline action-btn" (click)="shareStock(selectedStockDetails)">
                  <i class="fa fa-share"></i> 分享
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./stock-selection.component.scss']
})
export class StockSelectionComponent implements OnInit {
  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  loading = true;
  error: string | null = null;
  
  // 过滤器属性
  searchTerm = '';
  selectedMarket = '';
  showOnlySelected = false;

  // Stock details modal
  showStockDetailsModal = false;
  selectedStockDetails: Stock | null = null;

  constructor(
    private router: Router,
    private stockService: StockService,
    private notificationService: NotificationService
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
                featured: index === 0,
                category: this.getRandomCategory()
              }));
              console.log('处理后的股票数据:', this.stocks);
            } else {
              this.error = '获取股票数据失败';
            }
            this.loading = false;
            this.filterStocks();
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
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 177.97, change: 2.4, selected: true, featured: true, volume: 45000000, category: 'tech' },
      { symbol: 'AAPL', name: 'Apple Inc.', price: 189.25, change: 0.8, selected: false, volume: 35000000, category: 'tech' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2456.78, change: 1.5, selected: false, volume: 28000000, category: 'tech' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 345.67, change: -0.5, selected: false, volume: 32000000, category: 'tech' },
      { symbol: 'JPM', name: 'JPMorgan Chase', price: 145.32, change: 1.2, selected: false, volume: 15000000, category: 'finance' },
      { symbol: 'XOM', name: 'Exxon Mobil', price: 98.45, change: -1.8, selected: false, volume: 22000000, category: 'energy' }
    ];
    this.filterStocks();
  }

  filterStocks() {
    this.filteredStocks = this.stocks.filter(stock => {
      const matchesSearch = !this.searchTerm || 
        stock.symbol.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesMarket = !this.selectedMarket || stock.category === this.selectedMarket;
      const matchesSelection = !this.showOnlySelected || stock.selected;
      
      return matchesSearch && matchesMarket && matchesSelection;
    });
  }

  toggleStock(stock: Stock) {
    stock.selected = !stock.selected;
    this.filterStocks();
    
    // Show notification when stock is selected/deselected
    if (stock.selected) {
      this.notificationService.showSuccess(
        '✅ 股票已选择',
        `${stock.symbol} (${stock.name}) 已添加到监控列表`
      );
    } else {
      this.notificationService.showInfo(
        'ℹ️ 股票已移除',
        `${stock.symbol} (${stock.name}) 已从监控列表移除`
      );
    }
  }

  getSelectedCount(): number {
    return this.stocks.filter(stock => stock.selected).length;
  }

  getTotalValue(): number {
    return this.stocks
      .filter(stock => stock.selected)
      .reduce((total, stock) => total + stock.price, 0);
  }

  getAverageChange(): number {
    const selectedStocks = this.stocks.filter(stock => stock.selected);
    if (selectedStocks.length === 0) return 0;
    
    const totalChange = selectedStocks.reduce((sum, stock) => sum + stock.change, 0);
    return totalChange / selectedStocks.length;
  }

  getCategoryName(category?: string): string {
    const categoryNames: { [key: string]: string } = {
      'tech': '科技',
      'finance': '金融',
      'energy': '能源'
    };
    return categoryNames[category || ''] || '';
  }

  formatVolume(volume?: number): string {
    if (!volume) return '0';
    
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
  }

  getRandomCategory(): string {
    const categories = ['tech', 'finance', 'energy'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  viewDetails(stock: Stock) {
    console.log('View details for', stock.symbol);
    this.selectedStockDetails = stock;
    this.showStockDetailsModal = true;
  }

  closeStockDetails() {
    this.showStockDetailsModal = false;
    this.selectedStockDetails = null;
  }

  // Stock details helper methods
  getVolumeStatus(volume: number | undefined): string {
    if (!volume) return '数据不可用';
    if (volume > 1000000) return '高活跃度';
    if (volume > 500000) return '中等活跃度';
    return '低活跃度';
  }

  getInvestmentRating(stock: Stock): string {
    if (stock.change >= 5) return 'rating-excellent';
    if (stock.change >= 2) return 'rating-good';
    if (stock.change >= 0) return 'rating-neutral';
    if (stock.change >= -2) return 'rating-caution';
    return 'rating-poor';
  }

  getInvestmentRatingText(stock: Stock): string {
    if (stock.change >= 5) return '强烈推荐';
    if (stock.change >= 2) return '推荐买入';
    if (stock.change >= 0) return '中性持有';
    if (stock.change >= -2) return '谨慎观望';
    return '建议避开';
  }

  getInvestmentIcon(stock: Stock): string {
    if (stock.change >= 5) return '🚀';
    if (stock.change >= 2) return '📈';
    if (stock.change >= 0) return '📊';
    if (stock.change >= -2) return '⚠️';
    return '📉';
  }

  getInvestmentAdvice(stock: Stock): string {
    if (stock.change >= 5) return '该股票表现强劲，具有很好的上涨潜力，建议考虑买入。';
    if (stock.change >= 2) return '股票表现良好，适合短期投资，建议适量买入。';
    if (stock.change >= 0) return '股票表现平稳，可以继续持有观察后续走势。';
    if (stock.change >= -2) return '股票有小幅下跌，建议谨慎观望，等待更好的买入时机。';
    return '股票下跌较多，建议暂时避开，等待市场回暖后再考虑。';
  }

  addToWatchlist(stock: Stock) {
    console.log('Adding to watchlist:', stock.symbol);
    // TODO: Implement watchlist functionality
    this.closeStockDetails();
  }

  selectForTrading(stock: Stock) {
    console.log('Selecting for trading:', stock.symbol);
    this.toggleStock(stock);
    this.closeStockDetails();
    
    this.notificationService.showSuccess(
      '🚀 交易选择',
      `${stock.symbol} 已选择用于交易策略配置`
    );
  }

  shareStock(stock: Stock) {
    console.log('Sharing stock:', stock.symbol);
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: `${stock.symbol} - ${stock.name}`,
        text: `查看 ${stock.name} (${stock.symbol}) 的最新股价：$${stock.price.toFixed(2)}`,
        url: window.location.href
      });
    }
  }

  proceedToNext() {
    if (this.getSelectedCount() > 0) {
      this.notificationService.showInfo(
        '🎯 进入策略选择',
        `已选择 ${this.getSelectedCount()} 只股票，开始配置交易策略`
      );
      this.router.navigate(['/strategy-selection']);
    } else {
      this.notificationService.showWarning(
        '⚠️ 请选择股票',
        '请至少选择一只股票才能进入策略配置'
      );
    }
  }
}

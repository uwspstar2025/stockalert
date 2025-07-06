import { Component } from '@angular/core';
import { StockService } from '../../services/stock.service';

@Component({
  selector: 'app-add-stock',
  templateUrl: './add-stock.component.html',
  styleUrls: ['./add-stock.component.scss']
})
export class AddStockComponent {
  stockSymbol = '';
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | 'info' = 'info';
  showSuggestions = false;
  suggestions: any[] = [];
  trackedStocks: string[] = [];

  constructor(private stockService: StockService) {
    this.loadTrackedStocks();
  }

  loadTrackedStocks() {
    this.stockService.getTrackedStocks().subscribe({
      next: (response) => {
        if (response.success) {
          this.trackedStocks = response.data.symbols || [];
        }
      },
      error: (error) => {
        console.error('Error loading tracked stocks:', error);
      }
    });
  }

  onInputChange() {
    const query = this.stockSymbol.trim();
    if (query.length >= 2) {
      this.searchStocks(query);
    } else {
      this.showSuggestions = false;
      this.suggestions = [];
    }
    this.clearMessage();
  }

  searchStocks(query: string) {
    this.stockService.searchStocks(query).subscribe({
      next: (response) => {
        if (response.success) {
          this.suggestions = response.data.slice(0, 5); // Show top 5 results
          this.showSuggestions = this.suggestions.length > 0;
        }
      },
      error: (error) => {
        console.error('Error searching stocks:', error);
        this.showSuggestions = false;
      }
    });
  }

  selectSuggestion(stock: any) {
    this.stockSymbol = stock.symbol;
    this.showSuggestions = false;
    this.suggestions = [];
  }

  addStock() {
    const symbol = this.stockSymbol.trim().toUpperCase();
    
    if (!symbol) {
      this.showMessage('Please enter a stock symbol', 'error');
      return;
    }

    if (this.trackedStocks.includes(symbol)) {
      this.showMessage(`${symbol} is already being tracked`, 'error');
      return;
    }

    this.isLoading = true;
    this.clearMessage();

    this.stockService.addNewStock(symbol).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.showMessage(`✅ ${symbol} added successfully!`, 'success');
          this.stockSymbol = '';
          this.trackedStocks.push(symbol);
          
          // Emit event to refresh stock list
          this.onStockAdded();
        } else {
          this.showMessage(response.message || 'Failed to add stock', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Failed to add stock';
        this.showMessage(`❌ ${errorMessage}`, 'error');
      }
    });
  }

  removeStock(symbol: string) {
    if (confirm(`Are you sure you want to remove ${symbol} from tracking?`)) {
      this.isLoading = true;
      
      this.stockService.removeStock(symbol).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showMessage(`✅ ${symbol} removed successfully!`, 'success');
            this.trackedStocks = this.trackedStocks.filter(s => s !== symbol);
            
            // Emit event to refresh stock list
            this.onStockRemoved();
          } else {
            this.showMessage(response.message || 'Failed to remove stock', 'error');
          }
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Failed to remove stock';
          this.showMessage(`❌ ${errorMessage}`, 'error');
        }
      });
    }
  }

  private showMessage(text: string, type: 'success' | 'error' | 'info') {
    this.message = text;
    this.messageType = type;
    
    // Auto-clear success messages
    if (type === 'success') {
      setTimeout(() => this.clearMessage(), 5000);
    }
  }

  private clearMessage() {
    this.message = '';
  }

  private onStockAdded() {
    // In a real app, you might emit an event or call a parent method
    window.location.reload(); // Simple refresh for now
  }

  private onStockRemoved() {
    // In a real app, you might emit an event or call a parent method
    window.location.reload(); // Simple refresh for now
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addStock();
    }
  }

  // Popular stock suggestions
  getPopularStocks() {
    return [
      { symbol: 'UBER', name: 'Uber Technologies Inc.' },
      { symbol: 'SPOT', name: 'Spotify Technology S.A.' },
      { symbol: 'ROKU', name: 'Roku Inc.' },
      { symbol: 'ZM', name: 'Zoom Video Communications Inc.' },
      { symbol: 'SHOP', name: 'Shopify Inc.' },
      { symbol: 'SQ', name: 'Block Inc.' },
      { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
      { symbol: 'IBM', name: 'International Business Machines' },
      { symbol: 'INTC', name: 'Intel Corporation' },
      { symbol: 'AMD', name: 'Advanced Micro Devices' }
    ];
  }

  addPopularStock(stock: any) {
    this.stockSymbol = stock.symbol;
    this.addStock();
  }
}

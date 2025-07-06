import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume?: number;
  lastUpdated?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  private selectedStocksSubject = new BehaviorSubject<Stock[]>([]);
  
  selectedStocks$ = this.selectedStocksSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllStocks(): Observable<any> {
    const url = `${this.apiUrl}/stocks`;
    console.log('StockService: Making request to:', url);
    return this.http.get(url);
  }

  getStock(symbol: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/stocks/${symbol}`);
  }

  getStockHistory(symbol: string, period: string = '1d'): Observable<any> {
    return this.http.get(`${this.apiUrl}/stocks/${symbol}/history?period=${period}`);
  }

  addToWatchlist(symbols: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/stocks/watchlist`, { symbols });
  }

  updateSelectedStocks(stocks: Stock[]) {
    this.selectedStocksSubject.next(stocks);
  }

  getSelectedStocks(): Stock[] {
    return this.selectedStocksSubject.value;
  }

  addNewStock(symbol: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/stocks/add`, { symbol });
  }

  removeStock(symbol: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/stocks/remove/${symbol}`);
  }

  getTrackedStocks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stocks/tracked`);
  }

  searchStocks(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/stocks/search/${query}`);
  }

  // Health check method
  checkApiHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl.replace('/api', '')}/health`);
  }
}

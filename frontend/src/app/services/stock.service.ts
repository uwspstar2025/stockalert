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
    return this.http.get(`${this.apiUrl}/stocks`);
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
}

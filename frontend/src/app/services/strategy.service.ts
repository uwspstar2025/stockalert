import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  category: string;
  buyTrigger: {
    type: string;
    value: number;
    unit: string;
    description: string;
  };
  sellTrigger: {
    type: string;
    value: number;
    unit: string;
    description: string;
  };
  riskLevel: string;
  expectedReturn: string;
  timeFrame: string;
  minInvestment: number;
  features: string[];
  popular?: boolean;
  advanced?: boolean;
}

export interface BacktestData {
  strategyId: string;
  period: string;
  totalTrades: number;
  winRate: string;
  totalReturn: string;
  maxDrawdown: string;
  sharpeRatio: string;
  avgHoldingDays: number;
  profitFactor: string;
}

@Injectable({
  providedIn: 'root'
})
export class StrategyService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  private selectedStrategySubject = new BehaviorSubject<TradingStrategy | null>(null);
  
  selectedStrategy$ = this.selectedStrategySubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllStrategies(params?: any): Observable<any> {
    let queryString = '';
    if (params) {
      const searchParams = new URLSearchParams(params);
      queryString = `?${searchParams.toString()}`;
    }
    return this.http.get(`${this.apiUrl}/strategies${queryString}`);
  }

  getStrategy(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/strategies/${id}`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/strategies/categories/list`);
  }

  getBacktestData(strategyId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/strategies/${strategyId}/backtest`);
  }

  selectStrategy(strategy: TradingStrategy) {
    this.selectedStrategySubject.next(strategy);
  }

  getSelectedStrategy(): TradingStrategy | null {
    return this.selectedStrategySubject.value;
  }

  clearSelection() {
    this.selectedStrategySubject.next(null);
  }
}

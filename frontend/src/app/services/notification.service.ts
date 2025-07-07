import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  dismissible: boolean;
  autoClose?: boolean;
  duration?: number;
}

export interface NotificationSettings {
  email: string;
  enableEmail: boolean;
  enableBrowser: boolean;
  enableSound: boolean;
  priceAlerts: boolean;
  strategyAlerts: boolean;
  marketAlerts: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  public alerts$ = this.alertsSubject.asObservable();

  private notificationSettings: NotificationSettings = {
    email: '',
    enableEmail: false,
    enableBrowser: true,
    enableSound: true,
    priceAlerts: true,
    strategyAlerts: true,
    marketAlerts: true
  };

  constructor(private http: HttpClient) {
    this.loadSettings();
    this.requestNotificationPermission();
  }

  // Alert Management
  showAlert(alert: Omit<Alert, 'id' | 'timestamp'>): string {
    const newAlert: Alert = {
      ...alert,
      id: this.generateId(),
      timestamp: new Date()
    };

    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next([newAlert, ...currentAlerts]);

    // Auto-close if specified
    if (alert.autoClose !== false) {
      const duration = alert.duration || this.getDefaultDuration(alert.type);
      setTimeout(() => {
        this.dismissAlert(newAlert.id);
      }, duration);
    }

    return newAlert.id;
  }

  dismissAlert(id: string): void {
    const currentAlerts = this.alertsSubject.value;
    const filteredAlerts = currentAlerts.filter(alert => alert.id !== id);
    this.alertsSubject.next(filteredAlerts);
  }

  clearAllAlerts(): void {
    this.alertsSubject.next([]);
  }

  // Convenience methods for different alert types
  showSuccess(title: string, message: string, options?: Partial<Alert>): string {
    return this.showAlert({
      type: 'success',
      title,
      message,
      dismissible: true,
      ...options
    });
  }

  showError(title: string, message: string, options?: Partial<Alert>): string {
    return this.showAlert({
      type: 'error',
      title,
      message,
      dismissible: true,
      autoClose: false,
      ...options
    });
  }

  showWarning(title: string, message: string, options?: Partial<Alert>): string {
    return this.showAlert({
      type: 'warning',
      title,
      message,
      dismissible: true,
      ...options
    });
  }

  showInfo(title: string, message: string, options?: Partial<Alert>): string {
    return this.showAlert({
      type: 'info',
      title,
      message,
      dismissible: true,
      ...options
    });
  }

  // Stock and Strategy specific notifications
  showStockAlert(stockSymbol: string, price: number, change: number, message: string): string {
    const changeIcon = change >= 0 ? '📈' : '📉';
    const changeText = change >= 0 ? '+' : '';
    
    return this.showAlert({
      type: change >= 0 ? 'success' : 'warning',
      title: `${changeIcon} ${stockSymbol} 价格变动`,
      message: `${message} 当前价格: $${price.toFixed(2)} (${changeText}${change.toFixed(2)}%)`,
      dismissible: true,
      autoClose: false
    });
  }

  showStrategyAlert(strategyName: string, action: string, details: string): string {
    return this.showAlert({
      type: 'info',
      title: `🎯 策略提醒: ${strategyName}`,
      message: `${action}: ${details}`,
      dismissible: true,
      autoClose: false
    });
  }

  // Email Notifications
  async sendEmailNotification(subject: string, body: string): Promise<boolean> {
    if (!this.notificationSettings.enableEmail || !this.notificationSettings.email) {
      return false;
    }

    try {
      const response = await this.http.post('/api/notifications/email', {
        to: this.notificationSettings.email,
        subject,
        body
      }).toPromise();

      this.showSuccess('📧 邮件通知', '邮件通知已发送');
      return true;
    } catch (error) {
      this.showError('📧 邮件失败', '邮件发送失败，请检查邮箱设置');
      return false;
    }
  }

  // Browser Notifications
  async showBrowserNotification(title: string, body: string, icon?: string): Promise<void> {
    if (!this.notificationSettings.enableBrowser) {
      return;
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }

  // Settings Management
  updateSettings(settings: Partial<NotificationSettings>): void {
    this.notificationSettings = { ...this.notificationSettings, ...settings };
    this.saveSettings();
  }

  getSettings(): NotificationSettings {
    return { ...this.notificationSettings };
  }

  // Test notifications
  testNotifications(): void {
    this.showSuccess('✅ 测试成功', '成功通知测试');
    this.showWarning('⚠️ 测试警告', '警告通知测试');
    this.showError('❌ 测试错误', '错误通知测试');
    this.showInfo('ℹ️ 测试信息', '信息通知测试');
    
    if (this.notificationSettings.enableBrowser) {
      this.showBrowserNotification('股票监控系统', '浏览器通知测试成功！');
    }
  }

  // Private helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getDefaultDuration(type: Alert['type']): number {
    switch (type) {
      case 'success': return 4000;
      case 'info': return 5000;
      case 'warning': return 7000;
      case 'error': return 0; // Don't auto-close errors
      default: return 5000;
    }
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(saved) };
      } catch (error) {
        console.warn('Failed to load notification settings:', error);
      }
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    } catch (error) {
      console.warn('Failed to save notification settings:', error);
    }
  }
}

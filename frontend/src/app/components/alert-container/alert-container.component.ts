import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Alert } from '../../services/notification.service';

@Component({
  selector: 'app-alert-container',
  template: `
    <div class="alert-container" *ngIf="alerts.length > 0">
      <div 
        *ngFor="let alert of alerts; trackBy: trackAlert" 
        class="alert"
        [ngClass]="'alert-' + alert.type"
        [@slideInOut]>
        
        <div class="alert-icon">
          <i [ngClass]="getAlertIcon(alert.type)"></i>
        </div>
        
        <div class="alert-content">
          <div class="alert-title">{{ alert.title }}</div>
          <div class="alert-message">{{ alert.message }}</div>
          <div class="alert-timestamp">{{ formatTime(alert.timestamp) }}</div>
        </div>
        
        <button 
          *ngIf="alert.dismissible"
          class="alert-close"
          (click)="dismissAlert(alert.id)"
          aria-label="关闭提醒">
          <i class="fa fa-times"></i>
        </button>
      </div>
      
      <div class="alert-actions" *ngIf="alerts.length > 1">
        <button class="btn btn-outline btn-sm" (click)="clearAll()">
          <i class="fa fa-trash"></i> 清除全部
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./alert-container.component.scss'],
  animations: [
    // Angular animations would go here
  ]
})
export class AlertContainerComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.alerts$.subscribe(
      alerts => this.alerts = alerts
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dismissAlert(id: string): void {
    this.notificationService.dismissAlert(id);
  }

  clearAll(): void {
    this.notificationService.clearAllAlerts();
  }

  trackAlert(index: number, alert: Alert): string {
    return alert.id;
  }

  getAlertIcon(type: Alert['type']): string {
    switch (type) {
      case 'success': return 'fa fa-check-circle';
      case 'error': return 'fa fa-exclamation-circle';
      case 'warning': return 'fa fa-exclamation-triangle';
      case 'info': return 'fa fa-info-circle';
      default: return 'fa fa-bell';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes === 0) {
      return '刚刚';
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}小时前`;
    }
  }
}

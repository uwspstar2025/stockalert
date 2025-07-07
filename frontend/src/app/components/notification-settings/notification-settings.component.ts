import { Component, OnInit } from '@angular/core';
import { NotificationService, NotificationSettings } from '../../services/notification.service';

@Component({
  selector: 'app-notification-settings',
  template: `
    <div class="notification-settings">
      <div class="settings-header">
        <h2><i class="fa fa-bell"></i> 通知设置</h2>
        <p>配置您的股票监控通知偏好</p>
      </div>

      <div class="settings-form">
        <!-- Email Settings -->
        <div class="setting-section">
          <h3><i class="fa fa-envelope"></i> 邮件通知</h3>
          
          <div class="form-group">
            <label class="switch-label">
              <input 
                type="checkbox" 
                [(ngModel)]="settings.enableEmail"
                (change)="updateSettings()">
              <span class="switch"></span>
              启用邮件通知
            </label>
          </div>
          
          <div class="form-group" *ngIf="settings.enableEmail">
            <label for="email">邮箱地址</label>
            <input 
              type="email" 
              id="email"
              [(ngModel)]="settings.email"
              (blur)="updateSettings()"
              placeholder="输入您的邮箱地址"
              class="form-control">
          </div>
        </div>

        <!-- Browser Notifications -->
        <div class="setting-section">
          <h3><i class="fa fa-desktop"></i> 浏览器通知</h3>
          
          <div class="form-group">
            <label class="switch-label">
              <input 
                type="checkbox" 
                [(ngModel)]="settings.enableBrowser"
                (change)="updateSettings()">
              <span class="switch"></span>
              启用浏览器弹窗通知
            </label>
          </div>
          
          <div class="form-group">
            <label class="switch-label">
              <input 
                type="checkbox" 
                [(ngModel)]="settings.enableSound"
                (change)="updateSettings()">
              <span class="switch"></span>
              启用提示音
            </label>
          </div>
        </div>

        <!-- SMS Settings -->
        <div class="setting-section">
          <h3><i class="fa fa-mobile-alt"></i> SMS 通知设置</h3>
          
          <div class="form-group">
            <label class="switch-label">
              <input 
                type="checkbox" 
                [(ngModel)]="settings.enableSMS"
                (change)="updateSettings()">
              <span class="switch"></span>
              启用短信通知
            </label>
          </div>
          
          <div class="form-group" *ngIf="settings.enableSMS">
            <label for="phoneNumber">手机号码</label>
            <input 
              type="tel" 
              id="phoneNumber"
              [(ngModel)]="settings.phoneNumber"
              (blur)="updateSettings()"
              placeholder="输入您的手机号码 (如: +86 138 0000 0000)"
              class="form-control">
            <small class="form-hint">请输入完整的手机号码，包括国家代码</small>
          </div>
        </div>

        <!-- Alert Types -->
        <div class="setting-section">
          <h3><i class="fa fa-filter"></i> 通知类型</h3>
          
          <div class="form-group">
            <label class="switch-label">
              <input 
                type="checkbox" 
                [(ngModel)]="settings.priceAlerts"
                (change)="updateSettings()">
              <span class="switch"></span>
              价格变动提醒
            </label>
          </div>
          
          <div class="form-group">
            <label class="switch-label">
              <input 
                type="checkbox" 
                [(ngModel)]="settings.strategyAlerts"
                (change)="updateSettings()">
              <span class="switch"></span>
              策略执行提醒
            </label>
          </div>
          
          <div class="form-group">
            <label class="switch-label">
              <input 
                type="checkbox" 
                [(ngModel)]="settings.marketAlerts"
                (change)="updateSettings()">
              <span class="switch"></span>
              市场动态提醒
            </label>
          </div>
        </div>

        <!-- Test Section -->
        <div class="setting-section">
          <h3><i class="fa fa-flask"></i> 测试通知</h3>
          <p class="section-description">测试您的通知设置是否正常工作</p>
          
          <div class="test-buttons">
            <button class="btn btn-outline" (click)="testNotifications()">
              <i class="fa fa-play"></i> 测试所有通知
            </button>
            <button class="btn btn-outline" (click)="testStockAlert()" *ngIf="settings.priceAlerts">
              <i class="fa fa-chart-line"></i> 测试股票提醒
            </button>
            <button class="btn btn-outline" (click)="testEmailNotification()" *ngIf="settings.enableEmail && settings.email">
              <i class="fa fa-envelope"></i> 测试邮件通知
            </button>
            <button class="btn btn-outline" (click)="testSMSNotification()" *ngIf="settings.enableSMS && settings.phoneNumber">
              <i class="fa fa-mobile-alt"></i> 测试短信通知
            </button>
          </div>
        </div>

        <!-- Save Button -->
        <div class="setting-section">
          <div class="form-actions">
            <button class="btn btn-primary" (click)="saveSettings()">
              <i class="fa fa-save"></i> 保存设置
            </button>
            <button class="btn btn-outline" (click)="resetSettings()">
              <i class="fa fa-refresh"></i> 重置默认
            </button>
          </div>
        </div>
      </div>

      <!-- Status Messages -->
      <div class="status-message success" *ngIf="showSaveSuccess">
        <i class="fa fa-check"></i> 设置已保存成功！
      </div>
    </div>
  `,
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {
  settings: NotificationSettings = {
    email: '',
    enableEmail: false,
    enableBrowser: true,
    enableSound: true,
    enableSMS: false,
    phoneNumber: '',
    priceAlerts: true,
    strategyAlerts: true,
    marketAlerts: true
  };

  showSaveSuccess = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.settings = this.notificationService.getSettings();
  }

  updateSettings(): void {
    this.notificationService.updateSettings(this.settings);
  }

  saveSettings(): void {
    this.notificationService.updateSettings(this.settings);
    this.showSaveSuccess = true;
    
    setTimeout(() => {
      this.showSaveSuccess = false;
    }, 3000);

    this.notificationService.showSuccess(
      '✅ 设置已保存', 
      '您的通知设置已成功更新'
    );
  }

  resetSettings(): void {
    this.settings = {
      email: '',
      enableEmail: false,
      enableBrowser: true,
      enableSound: true,
      enableSMS: false,
      phoneNumber: '',
      priceAlerts: true,
      strategyAlerts: true,
      marketAlerts: true
    };
    this.updateSettings();
    
    this.notificationService.showInfo(
      '🔄 设置已重置', 
      '通知设置已恢复为默认值'
    );
  }

  testNotifications(): void {
    this.notificationService.testNotifications();
  }

  testStockAlert(): void {
    this.notificationService.showStockAlert('TSLA', 315.35, 2.4, '达到您设置的价格提醒条件');
  }

  testEmailNotification(): void {
    if (this.settings.email) {
      this.notificationService.sendEmailNotification(
        '股票监控系统 - 测试邮件',
        `这是一封测试邮件，确认您的邮箱 ${this.settings.email} 可以正常接收通知。`
      );
    }
  }

  testSMSNotification(): void {
    if (this.settings.phoneNumber) {
      this.notificationService.testSMSNotification();
    }
  }
}

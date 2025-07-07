import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface SidebarItem {
  icon: string;
  label: string;
  route?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidebar">
      <div class="sidebar-content">
        <div class="sidebar-item" 
             *ngFor="let item of sidebarItems" 
             [class.active]="item.isActive"
             (click)="navigateTo(item)"
             [title]="item.label + ' - ' + item.route">
          <div class="item-icon">
            <mat-icon>{{ item.icon }}</mat-icon>
          </div>
          <div class="item-label">{{ item.label }}</div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  
  sidebarItems: SidebarItem[] = [
    {
      icon: 'dashboard',
      label: '选择股票',
      route: '/stock-selection',
      isActive: false
    },
    {
      icon: 'add_circle',
      label: '添加股票',
      route: '/add-stock',
      isActive: false
    },
    {
      icon: 'settings',
      label: '策略配置',
      route: '/strategy-selection',
      isActive: false
    },
    {
      icon: 'trending_up',
      label: '监控系统',
      route: '/tracking',
      isActive: false
    },
    {
      icon: 'analytics',
      label: '分析',
      route: '/analysis',
      isActive: false
    },
    {
      icon: 'notifications',
      label: '提醒',
      route: '/alerts',
      isActive: false
    },
    {
      icon: 'notifications_active',
      label: '通知设置',
      route: '/notification-settings',
      isActive: false
    },
    {
      icon: 'help',
      label: '帮助',
      route: '/help',
      isActive: false
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Set initial active state based on current route
    this.updateActiveState(this.router.url);
    
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateActiveState(event.urlAfterRedirects);
      }
    });
  }

  private updateActiveState(currentUrl: string) {
    this.sidebarItems.forEach(item => {
      item.isActive = item.route === currentUrl;
    });
  }

  navigateTo(item: SidebarItem) {
    console.log('Sidebar navigation clicked:', item);
    console.log('Attempting to navigate to:', item.route);
    
    if (item.route) {
      this.router.navigate([item.route]).then(
        (success) => {
          console.log('Navigation success:', success);
        },
        (error) => {
          console.error('Navigation error:', error);
        }
      );
    } else {
      console.error('No route defined for item:', item.label);
    }
  }
}

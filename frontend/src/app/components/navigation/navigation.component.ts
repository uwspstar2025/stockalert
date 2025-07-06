import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <mat-icon class="brand-icon">trending_up</mat-icon>
          <span>Stock Tracker</span>
        </div>
        
        <div class="nav-steps">
          <div class="step" 
               [class.active]="currentStep === 1" 
               [class.completed]="currentStep > 1"
               (click)="navigateToStep(1)">
            <div class="step-number">1</div>
            <span>选择股票</span>
          </div>
          
          <div class="step" 
               [class.active]="currentStep === 2" 
               [class.completed]="currentStep > 2"
               (click)="navigateToStep(2)">
            <div class="step-number">2</div>
            <span>选择策略</span>
          </div>
          
          <div class="step" 
               [class.active]="currentStep === 3" 
               [class.completed]="currentStep > 3"
               (click)="navigateToStep(3)">
            <div class="step-number">3</div>
            <span>监控系统</span>
          </div>
          
          <div class="step" 
               [class.active]="currentStep === 4" 
               [class.completed]="currentStep > 4"
               (click)="navigateToStep(4)">
            <div class="step-number">4</div>
            <span>投资组合</span>
          </div>
          
          <div class="step" 
               [class.active]="currentStep === 5" 
               [class.completed]="currentStep > 5"
               (click)="navigateToStep(5)">
            <div class="step-number">5</div>
            <span>AI分析</span>
          </div>
          
          <div class="step" 
               [class.active]="currentStep === 6"
               (click)="navigateToStep(6)">
            <div class="step-number">6</div>
            <span>价格提醒</span>
          </div>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  currentStep = 1;

  constructor(private router: Router) {
    this.updateCurrentStep();
  }

  navigateToStep(step: number) {
    this.currentStep = step;
    switch (step) {
      case 1:
        this.router.navigate(['/stock-selection']);
        break;
      case 2:
        this.router.navigate(['/strategy-selection']);
        break;
      case 3:
        this.router.navigate(['/tracking']);
        break;
      case 4:
        this.router.navigate(['/portfolio']);
        break;
      case 5:
        this.router.navigate(['/analysis']);
        break;
      case 6:
        this.router.navigate(['/alerts']);
        break;
    }
  }

  private updateCurrentStep() {
    const url = this.router.url;
    if (url.includes('stock-selection')) this.currentStep = 1;
    else if (url.includes('strategy-selection')) this.currentStep = 2;
    else if (url.includes('tracking')) this.currentStep = 3;
    else if (url.includes('portfolio')) this.currentStep = 4;
    else if (url.includes('analysis')) this.currentStep = 5;
    else if (url.includes('alerts')) this.currentStep = 6;
  }
}

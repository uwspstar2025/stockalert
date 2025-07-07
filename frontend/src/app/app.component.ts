import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-alert-container></app-alert-container>
      <app-sidebar></app-sidebar>
      <div class="main-layout">
        <app-navigation></app-navigation>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-chatbot></app-chatbot>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Stock Tracker';
}

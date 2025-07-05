import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppComponent } from './app.component';
import { StockSelectionComponent } from './components/stock-selection/stock-selection.component';
import { TrackingSystemComponent } from './components/tracking-system/tracking-system.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { NavigationComponent } from './components/navigation/navigation.component';

const routes: Routes = [
  { path: '', redirectTo: '/stock-selection', pathMatch: 'full' },
  { path: 'stock-selection', component: StockSelectionComponent },
  { path: 'tracking-system', component: TrackingSystemComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'alerts', component: AlertsComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    StockSelectionComponent,
    TrackingSystemComponent,
    PortfolioComponent,
    AnalysisComponent,
    AlertsComponent,
    NavigationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatGridListModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

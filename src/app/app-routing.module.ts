import { NgModule, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginGuard } from './guards/login.guard';
import { AuthService } from './services/auth.service';
import { PredictDataComponent } from './components/predict-data/predict-data.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SavedPredictionsComponent } from './components/saved-predictions/saved-predictions.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ViewPredictionsComponent } from './components/view-predictions/view-predictions.component';

const routes: Routes = [
  {
    path: 'login', component: LoginComponent, canActivate: [LoginGuard]
  },
  {
    path: '', redirectTo: '/home', pathMatch: 'full'
  },
  {
    path: 'home', component: HomeComponent, canActivate: [LoginGuard]
  },
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [LoginGuard]
  },
  {
    path: 'predict-data', component: PredictDataComponent, canActivate: [LoginGuard]
  },
  {
    path: 'saved-predictions', component: SavedPredictionsComponent, canActivate: [LoginGuard]
  },
  {
    path: 'logout', component: LogoutComponent
  },
  {
    path: 'view-predictions', component: ViewPredictionsComponent, canActivate: [LoginGuard]
  },
  {
    path: '**', component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [LoginGuard, AuthService]
})
export class AppRoutingModule { }

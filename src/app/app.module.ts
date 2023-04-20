import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToastrModule, ToastContainerModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoadingComponent } from './components/loading/loading.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PredictDataComponent } from './components/predict-data/predict-data.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SavedPredictionsComponent } from './components/saved-predictions/saved-predictions.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ViewPredictionsComponent } from './components/view-predictions/view-predictions.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoadingComponent,
    LoginComponent,
    NavbarComponent,
    DashboardComponent,
    PredictDataComponent,
    PageNotFoundComponent,
    SavedPredictionsComponent,
    LogoutComponent,
    ViewPredictionsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    NgxSpinnerModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
      disableTimeOut: false,
      tapToDismiss: true,
      newestOnTop: true,
      extendedTimeOut: 1000,
      easeTime: 200
    }),
    ToastContainerModule,
    AppRoutingModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule {
  constructor() {
    if ( localStorage.getItem('sessionToken') == null ) {
      localStorage.setItem('isLoggedIn', 'false');
    }
    else {
      localStorage.setItem('isLoggedIn', 'true');
    }
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {
    loadingMessage = 'Logging out...';
    @ViewChild('loading', {static:true}) loading!: LoadingComponent;
    constructor(private auth: AuthService) { }
  
    ngOnInit(): void {
      this.loading.showLoading();
      console.log('Logout');
      this.auth.logout();
      console.log('Logout completed');
    }
}

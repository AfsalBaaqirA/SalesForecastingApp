import { Component, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent{
  @Input() message!: string; 
  constructor(private spinner: NgxSpinnerService) { }
  showLoading() {
    this.spinner.show();
  }
  hideLoading() {
    this.spinner.hide();
  }
}


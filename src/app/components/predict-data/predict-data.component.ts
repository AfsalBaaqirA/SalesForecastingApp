import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-predict-data',
  templateUrl: './predict-data.component.html',
  styleUrls: ['./predict-data.component.css']
})
export class PredictDataComponent {
  loadingMessage: string = 'Prediciting Data Hang On...';
  @ViewChild('loading', { static: true }) loading!: LoadingComponent;
  predictionName: string = '';
  forecastCount!: number;
  periodicity: string = '';
  file: any;

  @ViewChild('fileInput') fileInput!: ElementRef;
  constructor(private http: HttpClient, private router: Router) { }

  predictData(): void {
    this.loading.showLoading();
    const files: FileList = this.fileInput.nativeElement.files;
    if (files.length === 0) {
      return;
    };
    const formData: FormData = new FormData();
    formData.append('file', files[0], files[0].name);
    formData.append('predictionName', this.predictionName);
    formData.append('periodicity', this.periodicity);
    formData.append('forecastCount', this.forecastCount.toString());

    let headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');

    let options = { headers: headers };

    this.http.post('http://192.168.1.96:5000/api/predict-data/' + localStorage.getItem('sessionToken'), formData, options).subscribe(
      (data: any) => {
        console.log(data);
        this.loading.hideLoading();
        this.router.navigate(['/view-predictions']);
      }
    );
  }

  getFile(event: any): void {
    this.file = event.target.files[0];
  }
}

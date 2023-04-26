import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-view-predictions',
  templateUrl: './view-predictions.component.html',
  styleUrls: ['./view-predictions.component.css']
})
export class ViewPredictionsComponent implements OnInit {
  viewData: boolean;
  predictions: { predictionName: string, predictedValue: Array<number>, value: Array<number>, date: Array<Date>, predictedDate: Array<Date>, rmse: Number, mse: Number, mae: Number, predictionId: string }[] = [];
  prediction!: { predictionName: string, predictedValue: Array<number>, value: Array<number>, date: Array<Date>, predictedDate: Array<Date>, rmse: Number, mse: Number, mae: Number, predictionId: string };
  chartData!: ChartConfiguration<'line'>['data'];
  predictionCount: number = 0;
  chartOptions: ChartOptions<'line'> = {
    responsive: true
  };
  links = [
    { text: 'Dashboard', url: '/dashboard' },
    { text: 'Predict Data', url: '/predict-data' },
    { text: 'Logout', url: '/logout' }
  ];

  constructor(private http: HttpClient) {
    this.viewData = false;
  }

  ngOnInit(): void {
    this.http.get('http://192.168.1.96:5000/api/getPredictions/' + localStorage.getItem('sessionToken')).subscribe((data: any) => {
      //convert data to json array
      data = JSON.parse(JSON.stringify(data));
      this.predictionCount = data['predictions'].length;
      console.log(data);
      this.predictions = data.predictions;
    });
  }

  showPredictDetails(predictionId: string) {
    //iterate over the predictions array and find the prediction with the matching predictionId
    for (let i = 0; i < this.predictions.length; i++) {
      if (this.predictions[i].predictionId == predictionId) {
        this.prediction = this.predictions[i];
        break;
      }
    }
    console.log(this.prediction.predictedValue)
    //set the chart data
    this.chartData = {
      labels: this.prediction.date.concat(this.prediction.predictedDate),
      datasets: [
        {
          label: 'Actual Value',
          data: this.prediction.value,
          borderColor: 'blue',
          tension: 1,
          fill: false
        },
        {
          label: 'Predicted Value',
          data: this.prediction.value.concat(this.prediction.predictedValue),
          borderColor: 'red',
          tension: 1,
          fill: false
        }
      ]
    };

    this.viewData = true;
  }

  deletePrediction(predictionId: string) {
    this.http.post('http://192.168.1.96:5000/api/deletePrediction/' + localStorage.getItem('sessionToken'), { 'predictionId': predictionId }).subscribe((data: any) => {
      //convert data to json array
      data = JSON.parse(JSON.stringify(data));
      console.log(data);
      if (data['status']['status'] == 200) {
        this.ngOnInit();
      }
    });

  }
}

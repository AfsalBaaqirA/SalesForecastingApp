import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  links = [
    { text: 'Logout', url: '/logout' },
  ];
  cards_color = [
    { color: 'purple-blue' },
    { color: 'salmon-pink' },
    { color: 'blue-green' },
    { color: 'purple-pink' }
  ];

  cards = [
    { title: 'Predict', subtitle: 'DATA', url: '/predict-data', color: this.cards_color[0].color },
    { title: 'Analyze', subtitle: 'DATA', url: '/view-predictions', color: this.cards_color[1].color },
    { title: 'Visualize', subtitle: 'DATA', url: '/visualize-prediction', color: this.cards_color[2].color },
    { title: 'Share', subtitle: 'DATA', url: '/share-data', color: this.cards_color[3].color }
  ];
}

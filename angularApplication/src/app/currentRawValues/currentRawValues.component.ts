import {Component} from '@angular/core';
import {PostsService} from '../services/posts.service';
import {LineChart} from '../charts/LineChart';

@Component({
  selector: 'app-current-raw-values',
  templateUrl: 'currentRawValues.component.html',
  providers: [PostsService]

})
export class CurrentRawValuesComponent {
  mauroLineChart: RawValuesLineChart;
  arthurLineChart: RawValuesLineChart;

  constructor(private postsService: PostsService) {
    this.postsService.getArthurMeasurements().subscribe(posts => {
      this.arthurLineChart = new RawValuesLineChart('rgba(153, 210, 246,0.2)', 'rgba(153, 210, 246,1)');
      this.arthurLineChart.lineChartLabels = [];
      this.arthurLineChart.lineChartData = [
        {label: 'Raw tick data per hour', data: []}
      ];
      if (posts != null) {
        const length = posts.results.length;
        for (let i = 13; i > 2; i--) {
          this.arthurLineChart.lineChartData[0].data.push(posts.results[length - i].ticks);
          this.arthurLineChart.lineChartLabels.push(posts.results[length - i].hour);
        }
      }
    });
    this.postsService.getMauroMeasurements().subscribe(posts => {
      this.mauroLineChart = new RawValuesLineChart('rgba(66,66,69,0.2)', 'rgba(66,66,69,1)');
      this.mauroLineChart.lineChartLabels = [];
      this.mauroLineChart.lineChartData = [
        {label: 'Raw tick data per hour', data: []}
      ];
      if (posts != null) {
        const length = posts.results.length;
        for (let i = 12; i > 1; i--) {
          this.mauroLineChart.lineChartData[0].data.push(posts.results[length - i].ticks);
          this.mauroLineChart.lineChartLabels.push(posts.results[length - i].hour);
        }
      }
    });
  }
}

class RawValuesLineChart implements LineChart {
  lineChartData: Array<any>;
  lineChartLabels: Array<any>;
  lineChartOptions: any = {
    responsive: true
  };
  lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }];
  lineChartLegend: any = true;
  lineChartType: any = 'line';

  constructor(backgroundColor: any, pointColor: any) {
    this.lineChartColors = [
      {
        backgroundColor: backgroundColor,
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: pointColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)'
      }];
  }

  chartClicked(e: any): void {
  }

  chartHovered(e: any): void {
  }
}



import {Component} from '@angular/core';
import {PostsService} from '../services/posts.service';
import {Data} from '../services/Data';
import {LineChart} from '../charts/LineChart';

@Component({
  selector: 'app-past-consumption',
  templateUrl: 'pastConsumption.component.html',
  providers: [PostsService]

})
export class PastConsumptionComponent {
  mauroMeasurements: Data;
  arthurMeasurements: Data;

  mauro12: HourlyLineChart;
  mauro24: HourlyLineChart;
  mauro48: HourlyLineChart;

  arthur12: HourlyLineChart;
  arthur24: HourlyLineChart;
  arthur48: HourlyLineChart;

  constructor(private postsService: PostsService) {
    this.postsService.getMauroMeasurements().subscribe(posts => {
      this.mauroMeasurements = posts;
      this.mauro12 = new HourlyLineChart(12, false,'rgba(66,66,69,0.2)','rgba(66,66,69,1)');
      this.mauro24 = new HourlyLineChart(24, false,'rgba(66,66,69,0.2)','rgba(66,66,69,1)');
      this.mauro48 = new HourlyLineChart(48, false,'rgba(66,66,69,0.2)','rgba(66,66,69,1)');

      this.mauro12.genListData(posts);
      this.mauro24.genListData(posts);
      this.mauro48.genListData(posts);
    });

    this.postsService.getArthurMeasurements().subscribe(posts => {
      this.arthurMeasurements = posts;


      this.arthur12 = new HourlyLineChart(12, true,'rgba(153, 210, 246,0.2)','rgba(153, 210, 246,1)');
      this.arthur24 = new HourlyLineChart(24, true,'rgba(153, 210, 246,0.2)','rgba(153, 210, 246,1)');
      this.arthur48 = new HourlyLineChart(48, true,'rgba(153, 210, 246,0.2)','rgba(153, 210, 246,1)');

      this.arthur12.genListData(posts);
      this.arthur24.genListData(posts);
      this.arthur48.genListData(posts);
    });
  }
}

class HourlyLineChart implements LineChart {
  lineChartData: Array<any> = [{data: [], label: 'Watt per hour'}];
  lineChartLabels: Array<any> = [];
  public lineChartOptions: any = {
    responsive: true
  };
  public lineChartLegend: any = true;
  public lineChartType: any = 'line';
  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }];
  range: any = 0;
  dialMeter: any = false;

  constructor(destinedRange: number, dialMeter: boolean,backgroundColor:any,pointColor:any) {
    this.range = destinedRange;
    this.dialMeter = dialMeter;
    this.lineChartColors= [
      {
        backgroundColor: backgroundColor,
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: pointColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)'
      }];
  }

  public genListData(values: Data): void {
    if (values != null) {
      const length = values.results.length;
      for (let i = this.range; i > 1; i--) {
        if (this.dialMeter) {
          let val = values.results[length - i].ticks;
          val = val / 187.5;
          val = val * 1000;
          this.lineChartData[0].data.push(val);
        } else {
          this.lineChartData[0].data.push(values.results[length - i].ticks);
        }

        this.lineChartLabels.push(values.results[length - i].hour);
      }
    }
  }

  chartClicked(e: any): void {
  }

  chartHovered(e: any): void {
  }
}

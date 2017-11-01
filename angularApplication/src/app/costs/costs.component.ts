import {Component} from '@angular/core';
import {PostsService} from '../services/posts.service';
import {BarChart} from '../charts/BarChart';

@Component({
  selector: 'app-root',
  templateUrl: './costs.component.html',
  providers: [PostsService]
})

export class CostsComponent {
  mauroBarChart: CostBarChart;

  constructor(private postsService: PostsService) {
    this.postsService.getMauroMeasurements().subscribe(posts => {
      this.mauroBarChart = new CostBarChart();
      const price = [];
      const date = [];
      let ticksPerDay = 0;
      let prevDay = posts[0].day;
      for (let i = 0; i < posts.length; i++) {
        const currentDay = posts[i].day;
        if (currentDay === prevDay) {
          ticksPerDay += posts[i].ticks;
        } else {
          price.push(ticksPerDay * 0.00023);
          date.push(posts[i].day + '-' + posts[i].month);
          ticksPerDay = 0;
        }
        prevDay = currentDay;
      }
      this.mauroBarChart.barChartData[0].data = price;
      this.mauroBarChart.barChartLabels = date;
    });
  }
}

class CostBarChart implements BarChart {
  barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  barChartLabels: string[];
  barChartType: any = 'bar';
  barChartLegend: any = true;
  barChartData: any[] = [{data: [], label: '€'}];

  chartClicked(e: any): void {
  }

  chartHovered(e: any): void {
  }
}


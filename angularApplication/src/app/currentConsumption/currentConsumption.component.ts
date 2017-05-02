import {Component} from '@angular/core';
import {PostsService} from '../services/posts.service';
import {PieChart} from '../charts/PieChart';

@Component({
  selector: 'app-current-energy-consumption',
  templateUrl: 'currentConsumption.component.html',
  providers: [PostsService]

})
export class CurrentConsumptionComponent {
  mauroPieChart: UsagePieChart;
  mauroPreviousTime: number;
  mauroCurrentTime: number;
  mauroDeltaTime: number;
  mauroCurrentUsage: number;

  arthurPieChart: UsagePieChart;
  arthurPreviousTime: number;
  arthurCurrentTime: number;
  arthurDeltaTime: number;
  arthurCurrentUsage: number;

  constructor(private postsService: PostsService) {
    this.postsService.getMauroDelta().subscribe(posts => {
      this.mauroPieChart = new UsagePieChart();
      this.mauroPreviousTime = posts.current_tick;
      this.mauroCurrentTime = posts.previous_tick;

      this.mauroDeltaTime = this.mauroPreviousTime - this.mauroCurrentTime;
      this.mauroCurrentUsage = Math.floor(3600 / this.mauroDeltaTime);

      const scale = 3600 - +this.mauroCurrentUsage;
      this.mauroPieChart.pieChartData = [this.mauroCurrentUsage, scale];
    });

    this.postsService.getArthurDelta().subscribe(posts => {
      this.arthurPieChart = new UsagePieChart();
      this.arthurPreviousTime = posts.current_tick;
      this.arthurCurrentTime = posts.previous_tick;

      this.arthurDeltaTime = this.arthurPreviousTime - this.arthurCurrentTime;
      this.arthurCurrentUsage = Math.floor(3600 / this.arthurDeltaTime);

      const scale = 3600 - +this.arthurCurrentUsage;
      this.arthurPieChart.pieChartData = [this.arthurCurrentUsage, scale];
    });
  }
}

class UsagePieChart implements PieChart {
  pieChartLabels: string[] = ['Usage', ''];
  pieChartData: number[];
  pieChartType: any = 'pie';

  chartClicked(e: any): void {
  }

  chartHovered(e: any): void {
  }

}

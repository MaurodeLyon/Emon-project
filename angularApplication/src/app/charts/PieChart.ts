export interface PieChart {
  pieChartLabels: string[];
  pieChartData: number[];
  pieChartType: string;

  chartClicked(e: any): void ;
  chartHovered(e: any): void ;
}

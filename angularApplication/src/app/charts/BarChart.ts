export interface BarChart {
  barChartOptions: any;
  barChartLabels: string[];
  barChartType: string;
  barChartLegend: boolean;
  barChartData: any[];

  chartClicked(e: any): void;
  chartHovered(e: any): void;
}

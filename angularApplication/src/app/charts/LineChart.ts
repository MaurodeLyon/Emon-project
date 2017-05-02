export interface LineChart {
  lineChartData: Array<any>;
  lineChartLabels: Array<any>;
  lineChartOptions: any;
  lineChartColors: Array<any>;
  lineChartLegend: boolean;
  lineChartType: string;

  chartClicked(e: any): void;
  chartHovered(e: any): void;
}

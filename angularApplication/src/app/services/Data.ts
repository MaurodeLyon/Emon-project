export class Data {
  currentData: CurrentData;
  results: Results[];
}

export interface CurrentData {
  ticks: number;
  hour: number;
}

export interface Results {
  id: number;
  ticks: number;
  hour: number;
  day: number;
  month: number;
  year: number;
}


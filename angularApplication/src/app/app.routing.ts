import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {CurrentRawValuesComponent} from './currentRawValues/currentRawValues.component';
import {CurrentConsumptionComponent} from './currentConsumption/currentConsumption.component';
import {CostsComponent} from './costs/costs.component';
import {PastConsumptionComponent} from './pastConsumption/pastConsumption.component';
import {TrendComponent} from './trend/trend.component';

const appRoutes: Routes = [
  {
    path: '',
    component: CurrentRawValuesComponent
  },
  {
    path: 'currentConsumption',
    component: CurrentConsumptionComponent
  },
  {
    path: 'costs',
    component: CostsComponent
  },
  {
    path: 'pastConsumption',
    component: PastConsumptionComponent
  },
  {
    path: 'prediction',
    component: TrendComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);

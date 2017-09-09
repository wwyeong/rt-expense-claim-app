import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
// Forms Component

import { HistoryComponent } from './history.component';


// Components Routing
import { ComponentsRoutingModule } from './components-routing.module';

// ngx pagination
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    NgxPaginationModule,
    ComponentsRoutingModule,
  ],
  declarations: [
    HistoryComponent,
  ]
})
export class ComponentsModule { }

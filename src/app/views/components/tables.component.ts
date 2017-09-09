import { Component } from '@angular/core';
import { StorageSync, StorageStrategy } from 'angular2-storage-sync';
import {PaginatePipe, PaginationService} from 'ngx-pagination';

@Component({
  selector: 'course',
  templateUrl: 'tables.component.html',
  providers: [PaginationService],
})
export class TablesComponent {
  @StorageSync('claimHistory') claimHistory;
  @StorageSync('firstVisit') firstVisitHistory = false;
  p: number = 1;
  constructor() { 

  }

  ngOnInit(): void {
    console.log('claimHistory!!!');
    console.log(this.claimHistory);
    this.firstVisitHistory = true;
  }

}

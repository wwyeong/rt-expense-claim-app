import { Component } from '@angular/core';
import { StorageSync, StorageStrategy } from 'angular2-storage-sync';
import {PaginatePipe, PaginationService} from 'ngx-pagination';

@Component({
  selector: 'course',
  templateUrl: 'history.component.html',
  providers: [PaginationService],
})
export class HistoryComponent {
  @StorageSync('claimHistory') claimHistory;
  @StorageSync('firstVisit') firstVisitHistory = false;

  page: number = 1;

  constructor() { }

  ngOnInit(): void {
    this.firstVisitHistory = true;
  }

}

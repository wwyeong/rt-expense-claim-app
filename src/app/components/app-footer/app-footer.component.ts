import { Component } from '@angular/core';
// import { AppClaim } from '../app-claim';
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../component.service';
import { Router } from '@angular/router';
import { StorageSync, StorageStrategy } from 'angular2-storage-sync';

@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.component.html'
})
export class AppFooter {
  @StorageSync('claimHistory') claimHistory: Array<Object> = [];
  @StorageSync('firstVisitHistory') firstVisitHistory: boolean = false;

  ngOnInit(): void {
  }

  constructor(private commonService : CommonService, private router: Router) {
  }

  onClickAddClaim(){
    //reset to false
    this.commonService.notifyOther({option: 'onSubmit', value: 'From header'});
  }

  onClickClaimHistory(){
    console.log('reset!@@@');
    this.firstVisitHistory = false;
    console.log(this.firstVisitHistory);
    this.router.navigateByUrl('/history');
  }  

  onClickGoDesk(){
    this.router.navigateByUrl('/dashboard');//aaa
  }    

  resetHint(){
    this.firstVisitHistory = false;
  }    

  
}

import { Component, ViewChild, SimpleChanges, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FormGroup, FormArray, FormBuilder, Validators,  FormControl,  FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonService } from '../component.service';
import { BsModalService, ModalDirective} from 'ngx-bootstrap';
import { FileHolder, ImageUploadComponent} from 'angular2-image-upload/lib/image-upload/image-upload.component';
import { StorageSync, StorageStrategy } from 'angular2-storage-sync';
import { IMyDpOptions } from 'mydatepicker';

@Component({
  selector: 'app-claim',
  templateUrl: './app-claim.component.html',
  providers: [ImageUploadComponent]
})
export class AppClaim {
  @ViewChild('myModal') public childModal:ModalDirective;
  @ViewChild(ImageUploadComponent) imageUploadComponent: ImageUploadComponent;

  @StorageSync('rememberMe') remember: boolean = false;
  @StorageSync('firstVisitHistory') firstVisitHistory: boolean = false;
  @StorageSync('claimHistory') claimHistory: Array<Object> = [];
  @StorageSync('bankBookmarks') bankBookmarks: Array<Object> = [];

  @Input() inputData;

  //form type
  public claimForm: FormGroup;
  public bankForm: FormGroup;

  public selectedGlcode:string;
  public selectedDate:string;

  public defaultMalaysiaCurrency:string = 'MYR';
  public defaultMalaysiaGst:number = 6;

  public iValueCurrency:string = this.defaultMalaysiaCurrency;
  public iValueGst:number = this.defaultMalaysiaGst;
  public iValueExcRate:number = 0;
  public iValueAmount:number = 0;
  public iTotalAmount:number = 0;
  public iValueDesc:string;

  //GL code list
  public glCodeList:string[] = [
    '4165 - Staff Reimbursement Mobile Claim', 
    '4190 - Postage',
    '4191 - Couriers',
    '4200 - Stationery',
    '4311 - International Fares',
    '4312 - International Accomodation',
    '4313 - International Expenses',
    '4321 - Local Fares',
    '4322 - Local Accommodation',
    '4322 - Local Expenses',
    '4324 - Staff Incentives',
    '4325 - Staff flowers / Gifts',
    '4326 - Candidate Flowers / Gifts',
    '4327 - Entertainment - Clients',
    '4328 - Entertainment - Staff',
    '4329 - Subscriptions',
    '4330 - Memberships'];

  //Recipient Bank List
  public recpBankList:string[] = [
    'AFFIN BANK BERHAD / AFFIN ISLAMIC BANK',
    'AL-RAJHI BANKING &amp; INVESTMENT CORP (M) BERHAD',
    'ALLIANCE BANK MALAYSIA BERHAD',
    'AmBANK BERHAD',
    'BANK ISLAM MALAYSIA',
    'BANK KERJASAMA RAKYAT MALAYSIA BERHAD',
    'BANK MUAMALAT',
    'BANK OF AMERICA',
    'BANK OF CHINA (MALAYSIA) BERHAD',
    'BANK OF TOKYO-MITSUBISHI UFJ (M) BERHAD',
    'BANK PERTANIAN MALAYSIA BERHAD (AGROBANK)',
    'BANK SIMPANAN NASIONAL BERHAD',
    'BNP PARIBAS MALAYSIA',
    'CIMB BANK BERHAD',
    'CITIBANK BERHAD',
    'DEUTSCHE BANK (MSIA) BERHAD',
    'HONG LEONG BANK',
    'HSBC BANK MALAYSIA BERHAD',
    'INDUSTRIAL &amp; COMMERCIAL BANK OF CHINA',
    'J.P. MORGAN CHASE BANK BERHAD',
    'KUWAIT FINANCE HOUSE (MALAYSIA) BHD',
    'MAYBANK BERHAD',
    'MIZUHO CORPORATE BANK MALAYSIA',
    'OCBC BANK(MALAYSIA) BHD',
    'PUBLIC BANK',
    'RHB BANK',
    'STANDARD CHARTERED BANK',
    'SUMITOMO MITSUI BANKING CORPORATION MALAYSIA BHD',
    'UNITED OVERSEAS BANK BERHAD'];

  //Currency List
  public currencyList:string[] = [
    'JPY', 'CNY', 'SDG', 'RON', 'MKD', 'MXN', 'CAD',
    'ZAR', 'AUD', 'NOK', 'ILS', 'ISK', 'SYP', 'LYD', 'UYU', 'YER', 'CSD',
    'EEK', 'THB', 'IDR', 'LBP', 'AED', 'BOB', 'QAR', 'BHD', 'HNL', 'HRK',
    'COP', 'ALL', 'DKK', 'MYR', 'SEK', 'RSD', 'BGN', 'DOP', 'KRW', 'LVL',
    'VEF', 'CZK', 'TND', 'KWD', 'VND', 'JOD', 'NZD', 'PAB', 'CLP', 'PEN',
    'GBP', 'DZD', 'CHF', 'RUB', 'UAH', 'ARS', 'SAR', 'EGP', 'INR', 'PYG',
    'TWD', 'TRY', 'BAM', 'OMR', 'SGD', 'MAD', 'BYR', 'NIO', 'HKD', 'LTL',
    'SKK', 'GTQ', 'BRL', 'EUR', 'HUF', 'IQD', 'CRC', 'PHP', 'SVC', 'PLN',
    'USD'
  ]

  //header upload image
  public myHeaders:Array<object> = [{ header: 'Content-Type', value: 'multipart/form-data' }];
  
  //header subtitle
  public headerSubtitleTxt: string;
    
  public bsValue: any ;

  //date from calendar
  public dt: Date = new Date();

  //Subcription callback from deskboard add button
  private subscription: Subscription;

  //flag to define page exist
  public _claimFormPageShow = false;
  public _claimConfirmFormPageShow = false;
  public _claimSentFormPageShow = false;
  public _claimRecpBankPageShow = false;
  public _claimRecptUploadPageShow = false;
  public _claimSuccessPageShow = false;

  //image file holder
  private uploadedImageHolder: FileHolder;

  //date form options
  private myDatePickerOptions: IMyDpOptions;


  constructor( private _fb: FormBuilder, private commonService: CommonService, private bsModalService: BsModalService){
  }

  ngOnInit(): void {
    this.subscription = this.commonService.notifyObservable$.subscribe((res) => {
      this.childModal.show();
      this.showClaimFormPage();
      this.reset();
    });

    this.reset();
    this.remember = false;
    console.log(this.remember)
  }

  //reset to default
  public reset(){

    this.bankForm = this._fb.group({
        recpBank: ['', [Validators.required]],
        recpAccName: ['', [Validators.required]],
        recpAccNum: ['', [Validators.required]],
    });    

    let date = new Date();
    let isDate:Object = {date: {year: date.getFullYear(),month: date.getMonth() + 1,day: date.getDate()}};

    let tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate()+1);
    const tomorrowDateObj = {year: tomorrowDate.getFullYear(),month: tomorrowDate.getMonth() + 1,day: tomorrowDate.getDate()};


    this.myDatePickerOptions = {
      // other options...
      dateFormat: 'dd-mm-yyyy',
      disableSince: tomorrowDateObj
    };

    this.claimForm = this._fb.group({
        myDate: [isDate, Validators.required],
        bankAccounts: [0],
        desc: ['', [Validators.required]],
        costCenter: ['', [Validators.required]],
        glCode: ['', [Validators.required]],
        amount: ['', [Validators.required, Validators.minLength(1)]],
        gst: ['', [Validators.required, Validators.minLength(0)]],
        excRate: ['', [Validators.required, Validators.minLength(0.1)]],
        totalAmount: ['', [Validators.required, Validators.minLength(0)]],
    });    
    this.updateCurrency(this.defaultMalaysiaCurrency);

    this.selectedGlcode = '';

    const claimFormValue: Object = {
      desc: '',
      costCenter: '',
      glCode: '',
      amount: '',
      gst: 6,
      excRate: 0.1,
      totalAmount: '',
    };

    const bankForm: Object = {
      desc: '',
      costCenter: '',
      glCode: ''
    };

    // const claimFormValue: Object = {
    //   desc: 'Buy client a cup of tea',
    //   costCenter: 'Starbuck Coffee',
    //   glCode: '4327 - Entertainment - Clients',
    //   amount: 100,
    //   gst: 6,
    //   excRate: 0.1,
    //   totalAmount: '',
    // };

    // const bankForm: Object = {
    //   recpBank: 'Maybank',
    //   recpAccName: 'Tan Ah Kow',
    //   recpAccNum: '0123456789'
    // };

    (<FormGroup>this.claimForm).patchValue(claimFormValue, { onlySelf: true });
    (<FormGroup>this.bankForm).patchValue(bankForm, { onlySelf: true });
  }


  setDate(): void {
      // Set today date using the setValue function
      let date = new Date();
      this.claimForm.patchValue({myDate: {
      date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()}
      }});



  }

  clearDate(): void {
      // Clear the date using the setValue function
      this.claimForm.patchValue({myDate: null});
  }
  
  public getDate(): number {
    return this.dt && this.dt.getTime() || new Date().getTime();
  }
  
  public today(): void {
    this.dt = new Date();
  }

  public showSuccessPage(): void {
    this.headerSubtitleTxt = 'Claim has been submit successfully.';

    this._claimFormPageShow = false;
    this._claimConfirmFormPageShow = false;
    this._claimSentFormPageShow = false;
    this._claimRecpBankPageShow = false;
    this._claimRecptUploadPageShow = false;
    this._claimSuccessPageShow = true;
  }  

  public showRecpBankPage(): void {
    this.headerSubtitleTxt = 'Enter bank account details ( payment bank account):';

    this._claimFormPageShow = false;
    this._claimConfirmFormPageShow = false;
    this._claimSentFormPageShow = false;
    this._claimRecpBankPageShow = true;
    this._claimRecptUploadPageShow = false;
    this._claimSuccessPageShow = false;
  }  

  public showRecptUploadPage(): void {
    this.headerSubtitleTxt = 'Upload receipt';

    this._claimFormPageShow = false;
    this._claimConfirmFormPageShow = false;
    this._claimSentFormPageShow = false;
    this._claimRecpBankPageShow = false;
    this._claimRecptUploadPageShow = true;
    this._claimSuccessPageShow = false;
  }  

  public showClaimFormPage(): void {
    this.headerSubtitleTxt = 'Enter your expense details';

    this._claimFormPageShow = true;
    this._claimConfirmFormPageShow = false;
    this._claimSentFormPageShow = false;
    this._claimRecpBankPageShow = false;
    this._claimRecptUploadPageShow = false;
    this._claimSuccessPageShow = false;
  }

  public showConfirmFormPage(): void {
    this.headerSubtitleTxt = 'Confirm your expense claim details';

    this._claimFormPageShow = false;
    this._claimConfirmFormPageShow = true;
    this._claimSentFormPageShow = false;
    this._claimRecpBankPageShow = false;
    this._claimRecptUploadPageShow = false;
    this._claimSuccessPageShow = false;
    
  }

  public showSentFormPage(): void {
    this._claimFormPageShow = false;
    this._claimConfirmFormPageShow = false;
    this._claimSentFormPageShow = true;
    this._claimRecpBankPageShow = false;   
    this._claimRecptUploadPageShow = false; 
    this._claimSuccessPageShow = false;    
  }

  private goToNextPage(): void {
    if(this._claimFormPageShow){ //expense claim detail 
      const claimFormBankOptionValue = (<FormGroup>this.claimForm).get('bankAccounts').value;
      if(claimFormBankOptionValue > -1){
        if(this.bankBookmarks.length > 0){
          this.bankForm.patchValue({recpBank: this.bankBookmarks[claimFormBankOptionValue]['recpBank']});
          this.bankForm.patchValue({recpAccNum: this.bankBookmarks[claimFormBankOptionValue]['recpAccNum']});
          this.bankForm.patchValue({recpAccName: this.bankBookmarks[claimFormBankOptionValue]['recpAccName']});
        }
      }else{
        this.bankForm.patchValue({recpBank: ''});
        this.bankForm.patchValue({recpAccNum: ''});
        this.bankForm.patchValue({recpAccName: ''});
      }
      this.showRecptUploadPage();
    }else if(this._claimRecptUploadPageShow){ //upload receipt
      if(this.bankBookmarks === null || this.bankBookmarks.length === 0){
        this.showRecpBankPage();
      }else{
        const claimFormBankOptionValue = (<FormGroup>this.claimForm).get('bankAccounts').value;
        if(claimFormBankOptionValue > -1){
          this.showConfirmFormPage();
        }else{
          this.showRecpBankPage();
        }
      }
      this.imageUploadComponent.deleteAll();
    }else if(this._claimRecpBankPageShow){ //recipient bank account
      this.showConfirmFormPage();
    }else if(this._claimConfirmFormPageShow){
      this.showSuccessPage();
    }else{
      this.reset();
      this.showClaimFormPage();
    }
  }

  private goToPreviousPage(): void {
    if(this._claimRecptUploadPageShow){ //upload receipt
      this.showClaimFormPage();
    }else if(this._claimRecpBankPageShow){ //recipient bank account
      this.showRecptUploadPage();
    }else if(this._claimConfirmFormPageShow){ //final confirm expense claim detail and bank detail
      this.showRecpBankPage();
    }
  }

  //image drag/drop section
  public imageUploaded(e:FileHolder): void {
      this.uploadedImageHolder = e;
  }

  public imageRemoved(e:FileHolder): void {
      this.uploadedImageHolder = null;
  }  

  public disableSendButton(e:FileHolder): void {
      
  }

  public showButton(): void {
      
  }

  public validateInputField(input:any): boolean {
      return (input.valid === false && (input.dirty || input.touched));
    
  }

  public updateCurrency(currency:string): void {
    if(currency){
      const excControl = <FormArray>this.claimForm.controls['excRate'];
      this.iValueCurrency = currency.toUpperCase();
      if(this.iValueCurrency === 'MYR'){
        this.iValueGst = 6;
        this.claimForm.patchValue({gst: 6});
        excControl.disable();
      }else{
        this.iValueGst = 0;
        this.claimForm.patchValue({gst: 0});

        excControl.enable();
      }
      console.log('got update!!!')
      console.log('update iValueGst:'+this.iValueGst);

      this.calculateTotalAmount();
    }else{
      console.log('no update!!!')
    }
  }
  
  private onClickCurrency(){
    console.log('currency!!!! click!!!');
    this.iTotalAmount = 0;
  }

  private getTotalAmount(): number {
    this.iValueAmount = parseFloat(this.iValueAmount.toString()) || 0;
    this.iValueGst = parseFloat(this.iValueGst.toString()) || 0;
    this.iValueExcRate = parseFloat(this.iValueExcRate.toString()) || 0;

    let sumTotal:number = 0;

    if(this.iValueCurrency === 'MYR'){
      sumTotal = this.iValueAmount + (this.iValueAmount * (this.iValueGst/100));
    }else{
      sumTotal = (this.iValueAmount + (this.iValueAmount * (this.iValueGst/100))) * this.iValueExcRate;
    }

    sumTotal = parseFloat(sumTotal.toFixed(2));

    this.claimForm.patchValue({totalAmount: sumTotal.toString()});

    return this.iTotalAmount;
  }

  private updateGlCode(code:string){
    this.claimForm.patchValue({glCode: code});
  }

  private updateExcRate(rate:string){
    this.claimForm.patchValue({excRate: rate});
    this.calculateTotalAmount();
  }

  private updateDate(v:string){
    console.log('update date!!!');
    this.selectedDate = v;
    console.log(this.selectedDate === '')
  }

  private calculateTotalAmount(){
    this.iValueAmount = parseFloat((<FormGroup>this.claimForm).get('amount').value) || 0;
    this.iValueGst = parseFloat((<FormGroup>this.claimForm).get('gst').value) || 0;
    this.iValueExcRate = parseFloat((<FormGroup>this.claimForm).get('excRate').value) || 0;
    
    this.getTotalAmount();
  }

  private validateFormValid():boolean {
    if(this._claimFormPageShow){
      for (let key in this.claimForm.controls) {
        if (this.claimForm.controls.hasOwnProperty(key)) {
          let control: FormControl = <FormControl>this.claimForm.controls[key];
          if (!control.valid) {
            if(key === 'excRate' && this.iValueCurrency === 'MYR'){
              //do nothing
            }else{
              return false;
            }
          }
        }
      }
      return true;
    }else if(this._claimRecptUploadPageShow){
      if(this.uploadedImageHolder){
        return true;
      }
    }else if(this._claimRecpBankPageShow){
      return this.bankForm.valid;
    }else if(this._claimRecpBankPageShow){
      
    }
  }

  private onBookmarkContinue():void{
    const bankInfoMap = new Object();

    for (let key in this.bankForm.controls) {
      if (this.bankForm.controls.hasOwnProperty(key)) {
        let control: FormControl = <FormControl>this.bankForm.controls[key];
        bankInfoMap[key] = control.value;
      }
    }

    if(this.bankBookmarks.length > 0){
      console.log('bank bookmarks not empty!!!');
      console.log(this.bankBookmarks)

      if(!this.isExistBookmarkEqual(bankInfoMap)){ //no same record found
        console.log('diff record , require save!!!');

        let bookmarks:Array<any> = this.bankBookmarks;

        bookmarks.unshift(bankInfoMap);
        console.log('update length: '+bookmarks.length);
        this.bankBookmarks = bookmarks;
        console.log('actual length: '+this.bankBookmarks.length);
      }else{
        console.log('same record , no need save!!!');
      }

    }else {
      console.log('bank bookmarks is empty!!!');
      this.bankBookmarks = [bankInfoMap];
    }

    this.goToNextPage();
  }

  private isExistBookmarkEqual(bankInfoMap:object):boolean{
    for (var i = 0; i < this.bankBookmarks.length; i++) {
      const currentRecpBankValue: string = (<FormControl>this.bankForm.controls['recpBank']).value;
      const currentRecpAccNameValue: string = (<FormControl>this.bankForm.controls['recpAccName']).value;
      const currentRecpAccNumValue: string = (<FormControl>this.bankForm.controls['recpAccNum']).value;
      if(currentRecpBankValue == this.bankBookmarks[i]['recpBank'] && currentRecpAccNameValue == this.bankBookmarks[i]['recpAccName'] && currentRecpAccNumValue == this.bankBookmarks[i]['recpAccNum']){
        return true;
      }
    }
    return false;
  }

  private getFormartedDate(date:any):string{
    return date.day + '-' + date.month + '-' + date.year;
  }

  private getClaimFormValue(key:string):string{
    return (<FormControl>this.claimForm.controls[key]).value;
  }

  private getBankFormValue(key:string):string{
    return (<FormControl>this.bankForm.controls[key]).value;
  }

  onSubmitClaimForm(){
    const claimInfoMap = new Object();

    for (let key in this.claimForm.controls) {
      if (this.claimForm.controls.hasOwnProperty(key)) {
        let control: FormControl = <FormControl>this.claimForm.controls[key];
        claimInfoMap[key] = control.value;
      }
    }

    claimInfoMap['recpImage'] = 'img';
    //claimInfoMap['recpImage'] = this.uploadedImageHolder.src;

    claimInfoMap['transDate'] = this.selectedDate;
    claimInfoMap['submitDate'] = this.getTodayDate();

    if(this.claimHistory.length > 0){
      console.log('claim history not empty!!!');
      console.log(this.claimHistory)
      let history:Array<any> = this.claimHistory;
      history.push(claimInfoMap);
      console.log('update length: '+history.length);
      this.claimHistory = history;

      console.log('actual length: '+this.claimHistory.length);
    }else {
      console.log('claim history si empty!!!');
      this.firstVisitHistory = true;
      this.claimHistory = [claimInfoMap];
    }
    this.goToNextPage();
  }

  getTodayDate():string{
    var utc = new Date().toJSON().slice(0,10).replace(/-/g,'-');
    return utc;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }  
}

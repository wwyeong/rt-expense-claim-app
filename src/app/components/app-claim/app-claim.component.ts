import { Component, ViewChild, SimpleChanges, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FormGroup, FormArray, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../component.service';
import { BsModalService, ModalDirective } from 'ngx-bootstrap';
import { FileHolder, ImageUploadComponent } from 'angular2-image-upload/lib/image-upload/image-upload.component';
import { StorageSync, StorageStrategy } from 'angular2-storage-sync';
import { IMyDpOptions } from 'mydatepicker';

@Component({
  selector: 'app-claim',
  templateUrl: './app-claim.component.html',
  providers: [ImageUploadComponent]
})
export class AppClaim {
  @ViewChild('myModal') childModal: ModalDirective;
  @ViewChild(ImageUploadComponent) imageUploadComponent: ImageUploadComponent;

  @StorageSync('rememberMe') remember: boolean = false;
  @StorageSync('firstVisitHistory') firstVisitHistory: boolean = false;
  @StorageSync('claimHistory') claimHistory: Array<Object> = [];
  @StorageSync('bankBookmarks') bankBookmarks: Array<Object> = [];

  @Input() inputData;

  //form type
  claimForm: FormGroup;
  bankForm: FormGroup;

  selectedGlcode: string;
  selectedDate: string;

  defaultMalaysiaCurrency: string = 'MYR';
  defaultMalaysiaGst: number = 6;

  iValueCurrency: string = this.defaultMalaysiaCurrency;
  iValueGst: number = this.defaultMalaysiaGst;
  iValueExcRate: number = 0;
  iValueAmount: number = 0;
  iTotalAmount: number = 0;
  iValueDesc: string;

  //GL code list
  glCodeList: string[] = [
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
  recpBankList: string[] = [
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
  currencyList: string[] = [
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
  myHeaders: Array<object> = [{ header: 'Content-Type', value: 'multipart/form-data' }];

  //header subtitle
  headerSubtitleTxt: string;

  bsValue: any;

  //date from calendar
  dt: Date = new Date();

  //Subcription callback from deskboard add button
  subscription: Subscription;

  //flag to define page exist
  _claimFormPageShow = false;
  _claimConfirmFormPageShow = false;
  _claimSentFormPageShow = false;
  _claimRecpBankPageShow = false;
  _claimRecptUploadPageShow = false;
  _claimSuccessPageShow = false;

  //image file holder
  uploadedImageHolder: FileHolder;

  //date form options
  myDatePickerOptions: IMyDpOptions;

  constructor(private _fb: FormBuilder, private commonService: CommonService, private bsModalService: BsModalService) {
  }

  ngOnInit(): void {
    this.subscription = this.commonService.notifyObservable$.subscribe((res) => {
      this.childModal.show();
      this.showClaimFormPage();
      this.reset();
    });

    this.reset();
    this.remember = false;
  }

  //reset to default
  reset() {

    this.bankForm = this._fb.group({
      recpBank: ['', [Validators.required]],
      recpAccName: ['', [Validators.required]],
      recpAccNum: ['', [Validators.required]],
    });

    let date = new Date();
    let isDate: Object = { date: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() } };
    let tomorrowDate = new Date();

    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowDateObj = { year: tomorrowDate.getFullYear(), month: tomorrowDate.getMonth() + 1, day: tomorrowDate.getDate() };

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

    (<FormGroup>this.claimForm).patchValue(claimFormValue, { onlySelf: true });
    (<FormGroup>this.bankForm).patchValue(bankForm, { onlySelf: true });
  }

  setDate(): void {
    // Set today date using the setValue function
    let date = new Date();
    this.claimForm.patchValue({
      myDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
  }

  clearDate(): void {
    // Clear the date using the setValue function
    this.claimForm.patchValue({ myDate: null });
  }

  getDate(): number {
    return this.dt && this.dt.getTime() || new Date().getTime();
  }

  today(): void {
    this.dt = new Date();
  }

  showSuccessPage(): void {
    this.headerSubtitleTxt = 'Claim has been submit successfully.';

    this._claimFormPageShow = false;
    this._claimConfirmFormPageShow = false;
    this._claimSentFormPageShow = false;
    this._claimRecpBankPageShow = false;
    this._claimRecptUploadPageShow = false;
    this._claimSuccessPageShow = true;
  }

  showRecpBankPage(): void {
    this.headerSubtitleTxt = 'Enter bank account details ( payment bank account):';

    this._claimFormPageShow = false;
    this._claimConfirmFormPageShow = false;
    this._claimSentFormPageShow = false;
    this._claimRecpBankPageShow = true;
    this._claimRecptUploadPageShow = false;
    this._claimSuccessPageShow = false;
  }

  showRecptUploadPage(): void {
    this.headerSubtitleTxt = 'Upload receipt';

    this._claimFormPageShow = false;
    this._claimConfirmFormPageShow = false;
    this._claimSentFormPageShow = false;
    this._claimRecpBankPageShow = false;
    this._claimRecptUploadPageShow = true;
    this._claimSuccessPageShow = false;
  }

  showClaimFormPage(): void {
    this.headerSubtitleTxt = 'Enter your expense details';

    this._claimFormPageShow = true;
    this._claimConfirmFormPageShow = false;
    this._claimSentFormPageShow = false;
    this._claimRecpBankPageShow = false;
    this._claimRecptUploadPageShow = false;
    this._claimSuccessPageShow = false;
  }

  showConfirmFormPage(): void {
    this.headerSubtitleTxt = 'Confirm your expense claim details';

    this._claimFormPageShow = false;
    this._claimConfirmFormPageShow = true;
    this._claimSentFormPageShow = false;
    this._claimRecpBankPageShow = false;
    this._claimRecptUploadPageShow = false;
    this._claimSuccessPageShow = false;
  }

  showSentFormPage(): void {
    this._claimFormPageShow = false;
    this._claimConfirmFormPageShow = false;
    this._claimSentFormPageShow = true;
    this._claimRecpBankPageShow = false;
    this._claimRecptUploadPageShow = false;
    this._claimSuccessPageShow = false;
  }

  goToNextPage(): void {
    if (this._claimFormPageShow) { //expense claim detail 
      const claimFormBankOptionValue = (<FormGroup>this.claimForm).get('bankAccounts').value;

      if (claimFormBankOptionValue > -1 && this.bankBookmarks.length > 0) {
        this.bankForm.patchValue({ recpBank: this.bankBookmarks[claimFormBankOptionValue]['recpBank'] });
        this.bankForm.patchValue({ recpAccNum: this.bankBookmarks[claimFormBankOptionValue]['recpAccNum'] });
        this.bankForm.patchValue({ recpAccName: this.bankBookmarks[claimFormBankOptionValue]['recpAccName'] });
      } else {
        this.bankForm.patchValue({ recpBank: '' });
        this.bankForm.patchValue({ recpAccNum: '' });
        this.bankForm.patchValue({ recpAccName: '' });
      }

      this.showRecptUploadPage();
    } else if (this._claimRecptUploadPageShow) { //upload receipt

      if (this.bankBookmarks === null || this.bankBookmarks.length === 0) {
        this.showRecpBankPage();
      } else {
        const claimFormBankOptionValue = (<FormGroup>this.claimForm).get('bankAccounts').value;
        if (claimFormBankOptionValue > -1) {
          this.showConfirmFormPage();
        } else {
          this.showRecpBankPage();
        }
      }

      this.imageUploadComponent.deleteAll();
    } else if (this._claimRecpBankPageShow) { //recipient bank account
      this.showConfirmFormPage();
    } else if (this._claimConfirmFormPageShow) {
      this.showSuccessPage();
    } else {
      this.reset();
      this.showClaimFormPage();
    }
  }

  goToPreviousPage(): void {
    if (this._claimRecptUploadPageShow) { //upload receipt
      this.showClaimFormPage();
    } else if (this._claimRecpBankPageShow) { //recipient bank account
      this.showRecptUploadPage();
    } else if (this._claimConfirmFormPageShow) { //final confirm expense claim detail and bank detail
      this.showRecpBankPage();
    }
  }

  //image drag/drop section
  imageUploaded(e: FileHolder): void {
    this.uploadedImageHolder = e;
  }

  imageRemoved(e: FileHolder): void {
    this.uploadedImageHolder = null;
  }

  validateInputField(input: any): boolean {
    return input.valid === false && (input.dirty || input.touched);
  }

  updateCurrency(currency: string): void {
    if (!currency) return;

    const excControl = <FormArray>this.claimForm.controls['excRate'];
    this.iValueCurrency = currency.toUpperCase();

    if (this.iValueCurrency === 'MYR') {
      this.iValueGst = 6;
      excControl.disable();
    } else {
      this.iValueGst = 0;
      excControl.enable();
    }

    this.claimForm.patchValue({ gst: this.iValueGst });

    this.calculateTotalAmount();
  }

  onClickCurrency() {
    this.iTotalAmount = 0;
  }

  getTotalAmount(): number {
    this.iValueAmount = parseFloat(this.iValueAmount.toString()) || 0;
    this.iValueGst = parseFloat(this.iValueGst.toString()) || 0;
    this.iValueExcRate = parseFloat(this.iValueExcRate.toString()) || 0;

    let sumTotal: number = 0;

    if (this.iValueCurrency === 'MYR') {
      sumTotal = this.iValueAmount + (this.iValueAmount * (this.iValueGst / 100));
    } else {
      sumTotal = (this.iValueAmount + (this.iValueAmount * (this.iValueGst / 100))) * this.iValueExcRate;
    }

    sumTotal = parseFloat(sumTotal.toFixed(2));

    this.claimForm.patchValue({ totalAmount: sumTotal.toString() });

    this.iTotalAmount = sumTotal;

    return this.iTotalAmount;
  }

  updateGlCode(code: string) {
    this.claimForm.patchValue({ glCode: code });
  }

  updateExcRate(rate: string) {
    this.claimForm.patchValue({ excRate: rate });
    this.calculateTotalAmount();
  }

  updateDate(v: string) {
    this.selectedDate = v;
  }

  calculateTotalAmount() {
    const defaultToZero = key => parseFloat((<FormGroup>this.claimForm).get(key).value) || 0;

    this.iValueAmount = defaultToZero('amount');
    this.iValueGst = defaultToZero('gst');
    this.iValueExcRate = defaultToZero('excRate');

    this.getTotalAmount();
  }

  validateFormValid(): boolean {
    if (this._claimFormPageShow) {
      for (let key in this.claimForm.controls) {
        if (this.claimForm.controls.hasOwnProperty(key)) {
          let control: FormControl = <FormControl>this.claimForm.controls[key];
          if (!control.valid && (key !== 'excRate' || this.iValueCurrency !== 'MYR')) {
            return false;
          }
        }
      }
      return true;
    } else if (this._claimRecptUploadPageShow) {
      if (this.uploadedImageHolder) {
        return true;
      }
    } else if (this._claimRecpBankPageShow) {
      return this.bankForm.valid;
    }

    return false;
  }

  onBookmarkContinue(): void {
    const bankInfoMap = new Object();

    for (let key in this.bankForm.controls) {
      if (this.bankForm.controls.hasOwnProperty(key)) {
        let control: FormControl = <FormControl>this.bankForm.controls[key];
        bankInfoMap[key] = control.value;
      }
    }

    if (this.bankBookmarks.length > 0 && !this.isExistBookmarkEqual(bankInfoMap)) {
      let bookmarks: Array<any> = this.bankBookmarks;

      bookmarks.unshift(bankInfoMap);
      this.bankBookmarks = bookmarks;
    } else {
      this.bankBookmarks = [bankInfoMap];
    }

    this.goToNextPage();
  }

  isExistBookmarkEqual(bankInfoMap: object): boolean {
    for (var i = 0; i < this.bankBookmarks.length; i++) {
      const currentRecpBankValue: string = (<FormControl>this.bankForm.controls['recpBank']).value;
      const currentRecpAccNameValue: string = (<FormControl>this.bankForm.controls['recpAccName']).value;
      const currentRecpAccNumValue: string = (<FormControl>this.bankForm.controls['recpAccNum']).value;
      if (currentRecpBankValue == this.bankBookmarks[i]['recpBank'] && currentRecpAccNameValue == this.bankBookmarks[i]['recpAccName'] && currentRecpAccNumValue == this.bankBookmarks[i]['recpAccNum']) {
        return true;
      }
    }
    return false;
  }

  getFormartedDate(date: any): string {
    return date.day + '-' + date.month + '-' + date.year;
  }

  getClaimFormValue(key: string): string {
    return (<FormControl>this.claimForm.controls[key]).value;
  }

  getBankFormValue(key: string): string {
    return (<FormControl>this.bankForm.controls[key]).value;
  }

  onSubmitClaimForm() {
    const claimInfoMap = new Object();

    for (let key in this.claimForm.controls) {
      if (this.claimForm.controls.hasOwnProperty(key)) {
        let control: FormControl = <FormControl>this.claimForm.controls[key];
        claimInfoMap[key] = control.value;
      }
    }

    claimInfoMap['recpImage'] = 'img';
    claimInfoMap['transDate'] = this.selectedDate;
    claimInfoMap['submitDate'] = this.getTodayDate();

    if (this.claimHistory.length > 0) {
      let history: Array<any> = this.claimHistory;
      history.push(claimInfoMap);
      this.claimHistory = history;
    } else {
      this.firstVisitHistory = true;
      this.claimHistory = [claimInfoMap];
    }

    this.goToNextPage();
  }

  getTodayDate(): string {
    var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    return utc;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

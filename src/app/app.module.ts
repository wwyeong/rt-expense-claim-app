import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';
import { CommonService } from './components/component.service';

// Import containers
import {
  FullLayout,
  SimpleLayout
} from './containers';

const APP_CONTAINERS = [
  FullLayout,
  SimpleLayout
]

// Import components
import {
  AppFooter,
  AppHeader,
  AppClaim,
} from './components';

const APP_COMPONENTS = [
  AppFooter,
  AppHeader,
  AppClaim
]

// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from "ngx-bootstrap/modal";
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ImageUploadModule } from 'angular2-image-upload/lib/image-upload.module';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
  imports: [
    MyDatePickerModule,
    TypeaheadModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    ImageUploadModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    ...APP_COMPONENTS,
  ],
  providers: [{
    provide: LocationStrategy,
    useClass: HashLocationStrategy,
  }, CommonService],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

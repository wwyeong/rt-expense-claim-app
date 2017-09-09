import { NgModule } from '@angular/core';

import { LoginComponent } from './login.component';

import { PagesRoutingModule } from './pages-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [ PagesRoutingModule, FormsModule, ReactiveFormsModule, CommonModule],
  declarations: [
    LoginComponent,
  ]
})
export class PagesModule { }

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, Validators,  FormControl,  FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'login',
  templateUrl: 'login.component.html'
})
export class LoginComponent {

  public loginForm: FormGroup;

  constructor(private router: Router, private _fb: FormBuilder) {
  }
''
  ngOnInit(): void {
    this.loginForm = this._fb.group({
        email: ['', [Validators.email]],
        password: ['', [Validators.required]]
    });
  }

  public validateInputField(input:any): boolean {
    if(input.valid === false && (input.dirty || input.touched)){
      return true;
    }
  }

  login(){
    if(this.loginForm.valid){
      this.router.navigateByUrl('/dashboard');
    }
  }

}

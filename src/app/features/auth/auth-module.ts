import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SigninComponent } from './signin/signin';
import { SignupComponent } from './signup/signup';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SigninComponent, SignupComponent],
  exports: [SigninComponent, SignupComponent]
})
export class AuthModule {}
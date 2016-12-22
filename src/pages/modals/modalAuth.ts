import { Component, Output, EventEmitter } from '@angular/core';

import { Platform, ViewController } from 'ionic-angular';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'modal-auth',
  templateUrl: './modalAuth.html'
})

export class ModalAuthPage {

  currentUser: string;
  loginButtonMain: boolean = true;

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    private userService: UserService
  ) {

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  loggedInUser() {
    this.userService.getUser()
      .subscribe(data => {
        if (data) {
          this.currentUser = data;
          this.dismiss();
        }
      }, err => {
        // this.handleError(err);
        console.log(err);
      });
  }

  login(username, password) {
    this.userService.login(username, password).subscribe((result) => {
      if (result) {
        this.userService.isLoggedIn();
        this.loggedInUser();
        // this.getAllBudgets();
        // todo: add toaster here
      }
    }, err => {
      // this.handleError(err);
      console.error(err);
    });
  }

  signUp(username, password, confirmPassword, firstName) {
    this.userService.register(username, password, confirmPassword, firstName).subscribe((result) => {
      if (result) {
        this.userService.isLoggedIn();
        this.loggedInUser();
        // this.getAllBudgets();
        //todo: add toaster here
      }
    }, err => {
      // this.handleError(err);
      console.error(err);
    });
  }
}

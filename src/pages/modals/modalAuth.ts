import { Component, Output, EventEmitter } from '@angular/core';

import { Platform, ViewController, ToastController } from 'ionic-angular';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'modal-auth',
  templateUrl: './modalAuth.html'
})

export class ModalAuthPage {

  currentUser: string;
  loginButtonMain: boolean = true;
  validationErrors: any;
  hasValidationErrors: boolean = false;
  loading: boolean = false;

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    private userService: UserService
  ) {

  }

  showToast(message:string, position: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: position
    });

    toast.present(toast);
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  loggedInUser() {
    this.userService.getUser()
      .subscribe(data => {
        if (data) {
          this.currentUser = data;
          this.dismiss(this.currentUser);
          this.loading = false;
        }
      }, err => {
        this.handleError(err);
        console.log(err);
      });
  }

  login(username, password) {
    this.userService.login(username, password).subscribe((result) => {
      if (result) {
        this.userService.isLoggedIn();
        this.loggedInUser();

        this.showToast('Successfully logged in!', 'bottom');
      }
    }, err => {
      this.handleError(err);
      console.error(err);
    });
  }

  signUp(username, password, confirmPassword, firstName) {
    this.userService.register(username, password, confirmPassword, firstName).subscribe((result) => {
      if (result) {
        this.userService.isLoggedIn();
        this.loggedInUser();

        this.showToast('Consider yourself registered!', 'bottom');
      }
    }, err => {
      this.handleError(err);
      console.error(err);
    });
  }

  private handleError(error: any) {
    this.loading = false;
    let errorMessage = JSON.parse(error._body);
    // if the error has status 400 meaning there are form issues
    if (error.status === 400) {
      // tell user to fix the form issues
      this.showToast('Form Errors', 'bottom');
      console.log('response', errorMessage);
      this.hasValidationErrors = true;
      this.validationErrors = errorMessage;
    } else {
      // else display the message to the user
      let message = error && error.statusText;

      if (message) {
        this.showToast('Uh oh! ' + message, 'bottom');
      } else {
        message = 'Message not available.';
        this.showToast('Unexpected Error! ' + message, 'bottom');
      }

      // log the entire response to the console
      console.error(error);
    }
  }
}

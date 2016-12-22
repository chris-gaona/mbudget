import { Component } from '@angular/core';
import { ModalController, ViewController } from 'ionic-angular';

import { UserService } from '../../services/user.service';
import { ModalAuthPage } from '../modals/modalAuth';

@Component({
  template: `
    <ion-list no-lines no-margin class="popover-item">
      <ion-list-header>
        {{userService.isLoggedIn() ? 'User Info' : 'Login/Register'}}
      </ion-list-header>
      <ion-item *ngIf="userService.isLoggedIn()">
        <ion-avatar item-left>
          <img src="https://placeimg.com/100/100/animals">
        </ion-avatar>
        <h2>Hello, {{currentUser}}</h2>
        <p>Enjoy today!</p>
      </ion-item>
      <ion-item *ngIf="userService.isLoggedIn()">
        <button ion-button block padding-vertical (click)="userService.logout(); openAuthModal(); closePopover()">Logout</button>
      </ion-item>
      <ion-item *ngIf="!userService.isLoggedIn()">
        <button ion-button block padding-vertical>Login</button>
        <button ion-button block padding-vertical color="lighter" margin-top>Register</button>
      </ion-item>
    </ion-list>
  `
})
export class PopoverPage {

  currentUser: string;

  constructor(public modalCtrl: ModalController, public viewCtrl: ViewController, private userService: UserService) {

  }

  ngOnInit() {
    this.loggedInUser();
  }

  openAuthModal() {
    let modal = this.modalCtrl.create(ModalAuthPage);
    modal.present();
  }

  loggedInUser() {
    this.userService.getUser()
      .subscribe(data => {
        console.log(data);
        this.currentUser = data.firstName;
      }, err => {
        // this.handleError(err);
        console.log(err);
      });
  }

  // used to close the popover on command
  closePopover() {
    this.viewCtrl.dismiss();
  }
}

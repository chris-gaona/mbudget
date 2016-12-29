import { Component } from '@angular/core';
import { ModalController, ViewController, NavParams } from 'ionic-angular';

import { UserService } from '../../services/user.service';

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
        <h2>Hello, {{currentUser.firstName}}</h2>
        <p>Enjoy today!</p>
      </ion-item>
      <ion-item *ngIf="userService.isLoggedIn()">
        <button ion-button block padding-vertical (click)="userService.logout(); closePopover(true)">Logout</button>
      </ion-item>
      <ion-item *ngIf="!userService.isLoggedIn()">
        <button ion-button block padding-vertical>Login</button>
        <button ion-button block padding-vertical color="lighter" margin-top>Register</button>
      </ion-item>
    </ion-list>
  `
})
export class PopoverPage {

  currentUser: any;

  constructor(params: NavParams, public viewCtrl: ViewController, private userService: UserService) {
    this.currentUser = params.get('userInfo');
  }

  ngOnInit() {

  }

  // used to close the popover on command
  closePopover(data: boolean) {
    this.viewCtrl.dismiss(data);
  }
}

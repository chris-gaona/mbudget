import { Component } from '@angular/core';

import { UserService } from '../../services/user.service';

@Component({
  template: `
    <ion-list no-lines no-margin class="popover-item">
      <ion-list-header>
        {{userService.isLoggedIn() ? 'User Info' : 'Login/Register'}}
      </ion-list-header>
      <ion-item *ngIf="userService.isLoggedIn()">
        <ion-avatar item-left>
          <img src="https://placeimg.com/100/100/people">
        </ion-avatar>
        <h2>Hello, Chris</h2>
        <p>Enjoy today!</p>
      </ion-item>
      <ion-item *ngIf="userService.isLoggedIn()">
        <button ion-button block padding-vertical>Logout</button>
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

  constructor(private userService: UserService) {

  }

  ngOnInit() {

  }

  loggedInUser() {
    this.userService.getUser()
      .subscribe(data => {
        this.currentUser = data;
      }, err => {
        // this.handleError(err);
        console.log(err);
      });
  }
}

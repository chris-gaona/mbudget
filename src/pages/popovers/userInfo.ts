import { Component } from '@angular/core';

@Component({
  template: `
    <!--<ion-list>-->
      <!--<ion-item class="hello-text">-->
        <!--<ion-label>Hello, Chris</ion-label>-->
      <!--</ion-item>-->
    <!--</ion-list>-->
    <ion-list no-lines no-margin>
      <ion-list-header>
        User Info
      </ion-list-header>
      <ion-item>
        <ion-avatar item-left>
          <img src="https://placeimg.com/100/100/people">
        </ion-avatar>
        <h2>Hello, Chris</h2>
        <p>Enjoy today!</p>
      </ion-item>
      <ion-item>
        <button ion-button block padding-vertical>Logout</button>
      </ion-item>
      
      <!--<ion-item>-->
        <!--<button ion-button block padding-vertical>Login</button>-->
        <!--<button ion-button block padding-vertical color="light" margin-top>Register</button>-->
      <!--</ion-item>-->
    </ion-list>
  `
})
export class PopoverPage {

  constructor() {

  }

  ngOnInit() {

  }
}

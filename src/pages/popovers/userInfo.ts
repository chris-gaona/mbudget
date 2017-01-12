import { Component } from '@angular/core';
import { ViewController, NavParams, NavController } from 'ionic-angular';

import { AuthData } from '../../providers/auth-data';
import { ProfilePage } from '../profile/profile';

@Component({
  template: `
    <ion-list no-lines no-margin class="popover-item">
      <ion-list-header>
        User Info
      </ion-list-header>
      <ion-item>
        <ion-avatar item-left>
          <img src="https://placeimg.com/100/100/animals">
        </ion-avatar>
        <h2>Hello, {{currentUser.displayName}}</h2>
        <p>Enjoy today!</p>
      </ion-item>
      <ion-item>
        <button ion-button block padding-vertical (click)="goToProfilePage()">Your Profile</button>
      </ion-item>
    </ion-list>
  `
})
export class PopoverPage {

  currentUser: any;

  constructor(params: NavParams,
              public navCtrl: NavController,
              public viewCtrl: ViewController,
              public authData: AuthData) {
    this.currentUser = params.get('userInfo');
  }

  // used to close the popover on command
  closePopover(string?: string) {
    this.viewCtrl.dismiss(string);
  }

  goToProfilePage() {
    this.closePopover();
    this.navCtrl.push(ProfilePage);
  }
}

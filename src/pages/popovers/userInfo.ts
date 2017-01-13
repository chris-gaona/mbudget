import { Component } from '@angular/core';
import { ViewController, NavParams, NavController } from 'ionic-angular';

import { AuthData } from '../../providers/auth-data';

@Component({
  template: `
    <ion-list no-lines no-margin class="popover-item" id="greeting">
      <ion-list-header>
        User Info
      </ion-list-header>
      <ion-item>
        <ion-avatar item-left>
          <img src="https://placeimg.com/100/100/animals">
        </ion-avatar>
        <h2>Hello, {{currentUser.displayName}}</h2>
        <p id="member-since">Member since 1/11/16</p>
      </ion-item>
      <ion-item>
        <button ion-button block padding-vertical color="lighter" margin-bottom>Change profile pic</button>
        <button ion-button block padding-vertical (click)="closePopover('logout')">Logout</button>
      </ion-item>
    </ion-list>
  `,
  styles: [`
    ion-list-header {
      color: #fff;
      text-shadow: 1px 1px 1px #000;
    }
    #greeting {
      background-image: url("https://placeimg.com/500/500/animals");
      background-size: cover;
      background-repeat: no-repeat;
      width: 100%;
      height: 290px;
    }
    
    img {
      width: 80px !important;
      height: 80px !important;
    }
    
    #member-since {
      font-size: 1.1rem;
      margin-top: 5px;
    }
  `]
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
  closePopover(string: string) {
    this.viewCtrl.dismiss(string);
  }
}

import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  template: `
    <div id="background-image" [ngStyle]="{background: 'url(https://placeimg.com/500/500/animals)'}">
      <ion-list no-lines no-margin class="popover-item" id="greeting">
        <ion-list-header>
          User Info
        </ion-list-header>
        <ion-item id="border-radius-top-right">
          <ion-avatar item-left>
            <img src="https://placeimg.com/100/100/animals">
            <button id="profile-image-button" ion-button icon-only padding-vertical color="lighter" margin-bottom><ion-icon name="image"></ion-icon></button>
          </ion-avatar>
          <h2>Hello, {{currentUser.displayName}}</h2>
          <p>Enjoy today!</p>
        </ion-item>
        <ion-item id="border-radius-bottom-right">
          <button ion-button block padding-vertical (click)="closePopover('logout')">Logout</button>
        </ion-item>
      </ion-list>
     </div>
  `,
  styles: [`
    #background-image {
      width: 100% !important;
    }
    
    ion-list-header {
      color: #fff;
      text-shadow: 1px 1px 1px #000;
    }
    
    #greeting {
      position: relative;
      background-size: cover;
      background-repeat: no-repeat;
      width: 250px;
      height: 235px;
      opacity: .9;
    }
    
    img {
      width: 80px !important;
      height: 80px !important;
    }
    
    #border-radius-top-right {
      border-radius: 0 5px 0 0;
    }
    
    #border-radius-bottom-right {
      border-radius: 0 0 5px 0;
    }
    
    #profile-image-button {
      position: absolute;
      top: 60px;
      font-size: 1rem;
      border-radius: 50%;
    }
  `]
})
export class PopoverPage {

  currentUser: any;

  constructor(params: NavParams,
              public viewCtrl: ViewController) {
    this.currentUser = params.get('userInfo');
  }

  // used to close the popover on command
  closePopover(string: string) {
    this.viewCtrl.dismiss(string);
  }
}

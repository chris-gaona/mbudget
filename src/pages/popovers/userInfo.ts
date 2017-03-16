import { Component } from '@angular/core';
import { ViewController, NavParams, ActionSheetController, LoadingController } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { AuthData } from '../../providers/auth-data';
import * as firebase from 'firebase';

@Component({
  template: `
    <div *ngIf="!currentUser.photoURL" id="background-image" [ngStyle]="{background: 'url(https://placeimg.com/300/300/animals)'}">
      <ion-list no-lines no-margin class="popover-item" id="greeting">
        <ion-list-header>
          User Info
        </ion-list-header>
        <ion-item id="border-radius-top-right">
          <ion-avatar item-left>
            <img src="https://placeimg.com/300/300/animals">
            <button id="profile-image-button" ion-button icon-only padding-vertical color="lighter" margin-bottom (click)="openImageOptions()"><ion-icon name="image"></ion-icon></button>
          </ion-avatar>
          <h2>Hello, {{currentUser.displayName}}</h2>
          <p>Enjoy today!</p>
        </ion-item>
        <ion-item id="border-radius-bottom-right">
          <button ion-button block padding-vertical (click)="closePopover('logout')">Logout</button>
        </ion-item>
      </ion-list>
     </div>
     
     <div *ngIf="currentUser.photoURL" id="background-image" [ngStyle]="{ 'background-image': 'url(' + currentUser.photoURL + ')'}">
      <ion-list no-lines no-margin class="popover-item" id="greeting">
        <ion-list-header>
          User Info
        </ion-list-header>
        <ion-item id="border-radius-top-right">
          <ion-avatar item-left>
            <img src={{currentUser.photoURL}}>
            <button id="profile-image-button" ion-button icon-only padding-vertical color="lighter" margin-bottom (click)="openImageOptions()"><ion-icon name="image"></ion-icon></button>
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
  profilePictureRef: any;

  constructor(public params: NavParams,
              public viewCtrl: ViewController,
              public actionSheetCtrl: ActionSheetController,
              public loadingCtrl: LoadingController,
              public authData: AuthData) {
    this.currentUser = params.get('userInfo');

    this.profilePictureRef = firebase.storage().ref('/guestProfile/');
  }

  // used to close the popover on command
  closePopover(string: string) {
    this.viewCtrl.dismiss(string);
  }

  openImageOptions() {
    var self = this;

    let actionSheet = self.actionSheetCtrl.create({
      title: 'Upload new image from',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            this.openCamera(Camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Album',
          icon: 'folder-open',
          handler: () => {
            this.openCamera(Camera.PictureSourceType.PHOTOLIBRARY);
          }
        }
      ]
    });

    actionSheet.present();
  }

  openCamera(pictureSourceType: any) {
    Camera.getPicture({
      quality : 95,
      destinationType : Camera.DestinationType.DATA_URL,
      sourceType : pictureSourceType,
      allowEdit : true,
      encodingType: Camera.EncodingType.PNG,
      targetWidth: 400,
      targetHeight: 400,
      saveToPhotoAlbum: false
    }).then(imageData => {
      this.startUploading(imageData)
    }, error => {
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }

  startUploading(image) {
    let loader = this.loadingCtrl.create({
      content: "Uploading pic...",
      duration: 3000
    });
    loader.present();

    this.profilePictureRef.child(this.currentUser.uid).child('profile-image.png')
      .putString(image, 'base64', {contentType: 'image/png'})
      .then((savedPicture) => {
        this.authData.updateProfile(this.currentUser.firstName, savedPicture.downloadURL).then(() => {
          console.log('Profile updated!');

          loader.dismiss().then(() => {
            this.viewCtrl.dismiss();
          });

        }, (err) => {
          console.log(err);
        });
      }, (error) => {
        console.log(error);
      });
  }
}

import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Network, Diagnostic } from 'ionic-native';


@Injectable()
export class NetworkService {

  wifiConnected: boolean = true;

  constructor(public alertCtrl: AlertController) {
  }

  noConnection() {
    Network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
      this.showNetworkAlert();
      this.wifiConnected = false;
    });

    Network.onConnect().subscribe(() => {
      console.log('network connected :D');
      this.wifiConnected = true;
    });
  }

  private showSettings() {
    Diagnostic.switchToSettings();
  }

  showNetworkAlert() {
    let networkAlert = this.alertCtrl.create({
      title: 'No Internet Connection',
      message: 'Please check your internet connection.',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {}
        },
        {
          text: 'Settings',
          handler: () => {
            networkAlert.dismiss().then(() => {
              this.showSettings();
            })
          }
        }
      ]
    });
    networkAlert.present();
  }
}

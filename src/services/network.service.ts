import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Network, Diagnostic } from 'ionic-native';

let networkAlert;

@Injectable()
export class NetworkService {

  wifiConnected: boolean = true;
  onDisconnectSubscription: any;
  onConnectSubscription: any;

  constructor(public alertCtrl: AlertController) {
  }

  ngOnDestroy() {
    if (this.onConnectSubscription) {
      this.onConnectSubscription.unsubscribe();
    }

    if (this.onDisconnectSubscription) {
      this.onDisconnectSubscription.unsubscribe();
    }
  }

  showNetworkAlert() {
    networkAlert = this.alertCtrl.create({
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

  isNoConnection() {
    return (Network.type === 'none');
  }

  noConnection() {
    if (this.isNoConnection()) {
      this.showNetworkAlert();
      this.wifiConnected = false;
    }

    this.onDisconnectSubscription = Network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
      this.showNetworkAlert();
      this.wifiConnected = false;
    });

    this.onConnectSubscription = Network.onConnect().subscribe(() => {
      console.log('network connected :D');
      this.wifiConnected = true;
      networkAlert.dismiss();
    });
  }

  private showSettings() {
    Diagnostic.switchToSettings();
  }
}

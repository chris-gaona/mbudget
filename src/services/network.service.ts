import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Network, Diagnostic } from 'ionic-native';


@Injectable()
export class NetworkService {

  constructor(public alertCtrl: AlertController) {
  }

  noConnection() {
    let disconnectSubscription = Network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
      return true;
    });

    // stop disconnect watch
    disconnectSubscription.unsubscribe();
  }


  private showSettings() {
    if (Diagnostic.switchToWifiSettings()) {
      Diagnostic.switchToWifiSettings();
    } else {
      Diagnostic.switchToSettings();
    }
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
          text: 'Open Settings',
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

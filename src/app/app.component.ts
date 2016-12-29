import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar, Splashscreen, Network, Diagnostic } from 'ionic-native';

import { HomePage } from '../pages/home/home';

// import { TabsPage } from '../pages/tabs/tabs';


@Component({
  templateUrl: './app.html'
})
export class MyApp {
  rootPage = HomePage;

  constructor(platform: Platform, public alertCtrl: AlertController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  noConnection() {
    Network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
      this.showNetworkAlert();
    });
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

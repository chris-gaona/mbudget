import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';

import { NetworkService } from '../services/network.service';

import { AngularFire } from 'angularfire2';


@Component({
  templateUrl: './app.html'
})
export class MyApp {
  rootPage: any;
  subscription: any;

  constructor(platform: Platform, private networkService: NetworkService, public af: AngularFire) {
    // subscribe to check if current user is logged in... if so go to home page else go to login page
    this.subscription = af.auth.subscribe( user => {
      if (user) {
        this.rootPage = HomePage;
      } else {
        this.rootPage = LoginPage;
      }
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();

      networkService.noConnection();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

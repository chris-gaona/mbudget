import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Network, Diagnostic } from 'ionic-native';


@Injectable()
export class NetworkService {

  constructor(public alertCtrl: AlertController) {
  }


}

import { Component } from '@angular/core';

import { Platform, ViewController } from 'ionic-angular';

import { Keyboard } from 'ionic-native';


@Component({
  selector: 'modal-content',
  templateUrl: './modalContent.html'
})

export class ModalContentPage {
  month: string = '2016-12-19';
  cash: number = 25652.23;
  income: number = 1876.32;


  constructor(
    public platform: Platform,
    public viewCtrl: ViewController
  ) {

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  tapEvent(e) {
    Keyboard.close();
  }
}

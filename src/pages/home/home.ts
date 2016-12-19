import { Component } from '@angular/core';

import { ModalController, NavController, PopoverController } from 'ionic-angular';

import { PopoverPage } from '../popovers/userInfo';
import { ModalContentPage } from '../modals/modalContent';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController, public modalCtrl: ModalController) {

  }

  presentPopover(ev) {

    let popover = this.popoverCtrl.create(PopoverPage, {
    });

    popover.present({
      ev: ev
    });
  }

  openModal(characterNum) {

    let modal = this.modalCtrl.create(ModalContentPage, characterNum);
    modal.present();
  }

}

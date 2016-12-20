import { Component } from '@angular/core';

import { ModalController, NavController, PopoverController, AlertController } from 'ionic-angular';

import { PopoverPage } from '../popovers/userInfo';
import { ModalContentPage } from '../modals/modalContent';
import { EditPage } from '../contact/edit';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  projActual = 'actual';
  period = 'Nov21';

  projections = [
    {
      item: 'Gas',
      projection: 0
    },
    {
      item: 'Verizon',
      projection: 25
    },
    {
      item: 'Food',
      projection: 115.86
    },
    {
      item: 'Credit Card',
      projection: 50
    },
    {
      item: 'Miscellaneous',
      projection: 125.65
    },
    {
      item: 'Cash Withdrawal',
      projection: 20
    }
  ];

  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController, public modalCtrl: ModalController, public alertCtrl: AlertController) {

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

  goToContactPage() {
    //push another page onto the history stack
    //causing the nav controller to animate the new page in
    this.navCtrl.push(EditPage);
  }

  showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Use this lightsaber?',
      message: 'Do you agree to use this lightsaber to do good across the intergalactic galaxy?',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Agree',
          handler: () => {
            console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();
  }

}

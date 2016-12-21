import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-edit',
  templateUrl: './edit.html'
})
export class EditPage {

  items = [
    {
      name: 'Done 12/15',
      amount: 25.00,
    },
    {
      name: 'Livermore Gas',
      amount: 25.00
    }
  ];

  constructor(public navCtrl: NavController) {

  }

}

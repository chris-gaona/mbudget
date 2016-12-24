import { Component } from '@angular/core';

import { NavController, NavParams, AlertController } from 'ionic-angular';
import { ActualItems, Budget, BudgetItems } from '../../models/budget';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'page-edit',
  templateUrl: './edit.html'
})
export class EditPage {

  _id: any;
  budget: Budget;
  item: BudgetItems;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, private navParams: NavParams, private budgetService: BudgetService) {
    console.log(navParams.get('budgetItem'));
    this._id = navParams.get('_id');
    this.budget = navParams.get('budget');
    this.item = navParams.get('budgetItem');
  }

  // add new actual item to actual array under specific budget_items
  // pass in which actual array we want to add to
  addActualItem(actual) {
    // create a new actual item using the defined types
    let newActualItem = new ActualItems();
    // add that item to the array
    actual.push(newActualItem);
  }

  // save all edits
  saveAll() {
    // passes budget_items array to saveAll function on budgetService
    this.budgetService.updateBudgetById(this._id, this.budget)
      .subscribe(data => {
        // todo: do something with data returned here
        // todo: add toaster here
        console.log('Everything saved!');
      }, err => {
        // this.handleError(err);
        console.log(err);
      });
  }

  goBack() {
    this.navCtrl.pop();
  }

  capitalizeFirstLetter(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  showCheckbox() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Which to delete?');

    alert.addInput({
      type: 'checkbox',
      label: this.capitalizeFirstLetter(this.item.item) + ' (MAIN)',
      value: this.item.item
    });

    for (let i = 0; i < this.item.actual.length; i++) {
      alert.addInput({
        type: 'checkbox',
        label: this.capitalizeFirstLetter(this.item.actual[i].name) + ' $' + this.item.actual[i].amount,
        value: this.item.actual[i].name  + ' $' + this.item.actual[i].amount
      });
    }

    alert.addButton('Wait, cancel');
    alert.addButton({
      text: 'Yes, delete',
      handler: data => {
        console.log('Checkbox data:', data);
        // this.testCheckboxOpen = false;
        // this.testCheckboxResult = data;
      }
    });
    alert.present();
  }

}

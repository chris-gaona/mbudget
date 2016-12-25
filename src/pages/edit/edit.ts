import { Component } from '@angular/core';

import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
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

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              private navParams: NavParams,
              private budgetService: BudgetService) {
    console.log(navParams.get('budgetItem'));
    this._id = navParams.get('_id');
    this.budget = navParams.get('budget');
    this.item = navParams.get('budgetItem');
  }

  showToast(message:string, position: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: position
    });

    toast.present(toast);
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
        this.goBack();
        // todo: do something with data returned here

        this.showToast('Everything saved!', 'top');
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

        for (let i = 0; i < data.length; i++) {
          if (data[i] === this.item.item) {
            this.deleteBudgetItem(data[i]);
          } else {
            this.deleteActual(this.item, data[i]);
          }
        }
      }
    });
    alert.present();
  }

  // delete specific actual item
  // pass in the specific budget_item & the actual item within that budget_item
  deleteActual(budget, actual) {
    // loop through the actual array
    for (let i = 0; i < budget.actual.length; i++) {
      // if a match to the actual passed in
      if (budget.actual[i].name + ' $' + budget.actual[i].amount === actual) {
        // remove it
        budget.actual.splice(i, 1);
      }
    }
    console.log(budget);
  }

  // delete specific budget item
  deleteBudgetItem(budgetItem) {
    let budget = this.budget.budget_items;
    // loop through budget_items
    for (let i = 0; i < budget.length; i++) {
      // if a match to the budget passed in
      if (budget[i] === budgetItem) {
        // remove it
        budget.splice(i, 1);
      }
    }
  }

}

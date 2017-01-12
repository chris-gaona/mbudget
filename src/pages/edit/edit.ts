import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { ActualItems, Budget, BudgetItems } from '../../models/budget';
import { BudgetService } from '../../services/budget.service';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { AuthData } from '../../providers/auth-data';

@Component({
  selector: 'page-edit',
  templateUrl: './edit.html'
})
export class EditPage {
  allBudgets: FirebaseListObservable<any>;
  currentUser: any;
  budget: Budget;
  item: BudgetItems;
  validationErrors: any;
  hasValidationErrors: boolean = false;
  totalActual: number;
  loading: boolean = false;
  saveAllData: Budget;
  errorMessage: any;

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              private navParams: NavParams,
              private budgetService: BudgetService,
              public authData: AuthData,
              af: AngularFire) {
    this.budget = navParams.get('budget');
    this.item = navParams.get('budgetItem');

    this.currentUser = this.authData.getUserInfo();
    this.allBudgets = af.database.list('/users/' + this.currentUser.uid + '/budgets');
  }

  showToast(message:string, position: string, color: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: position,
      cssClass: color
    });

    toast.present(toast);
  }

  // save all edits
  saveAll() {
    let chosenBudgetKey;

    chosenBudgetKey = this.budget.$key;

    delete this.budget.$exists;
    delete this.budget.$key;
    this.budget.updatedAt = (new Date).toISOString();

    this.allBudgets.update(chosenBudgetKey, this.budget).then(() => {
      this.showToast('Everything saved!', 'bottom', 'toaster-green');
    }).catch((err) => {
      this.handleError(err);
      console.log(err);
    });

    this.goBack();
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

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Delete',
      handler: data => {

        for (let i = 0; i < data.length; i++) {
          if (data[i] === this.item.item) {
            console.log(this.item.item);
            console.log('data item', data[i]);
            this.deleteBudgetItem(data[i]);
          } else {
            this.deleteActual(this.item, data[i]);
          }
        }
      }
    });
    alert.present();
  }

  // add new actual item to actual array under specific budget_items
  // pass in which actual array we want to add to
  addActualItem(actual) {
    // create a new actual item using the defined types
    let newActualItem = new ActualItems();
    // add that item to the array
    actual.push(newActualItem);
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

      if (budget.actual.length === 0) {
        budget.actual.push(new ActualItems());
      }
    }
  }

  // delete specific budget item
  deleteBudgetItem(budgetItem) {
    console.log('budget item', budgetItem);
    let budget = this.budget.budget_items;
    // loop through budget_items
    for (let i = 0; i < budget.length; i++) {
      console.log(budget[i]);
      // if a match to the budget passed in
      if (budget[i].item === budgetItem) {
        // remove it
        budget.splice(i, 1);

        if (budget.length === 0) {
          budget.push(new BudgetItems());
        }

        this.saveAll();
      }
    }
  }

  // calculates the sub total for each budget_item
  getActualTotal(budget) {
    // initialize totalActual to 0
    this.totalActual = 0;
    // loop through each actual item in the array
    for (let i = 0; i < budget.actual.length; i++) {
      if (budget.actual[i].expense === true) {
        // add each amount to the total
        this.totalActual += +budget.actual[i].amount;
      } else {
        // subtract each amount to the total
        this.totalActual -= +budget.actual[i].amount;
      }
    }
    // return the total calculated
    return this.totalActual;
  }

  toggleAddSubtract(actual) {
    actual.expense = !actual.expense;
  }

  // todo: add unit test for error handler
  private handleError(error: any) {
    // else display the message to the user
    this.errorMessage = error && error.statusText;

    if (this.errorMessage) {
      this.showToast('Uh oh! ' + this.errorMessage, 'bottom', 'toaster-red');
    } else {
      this.errorMessage = 'Please try again.';
      this.showToast('Unexpected Error! ' + this.errorMessage, 'bottom', 'toaster-red');
    }

    // log the entire response to the console
    console.error(error);
  }

}

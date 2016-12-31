import { Component } from '@angular/core';

import { Platform, ViewController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { Keyboard } from 'ionic-native';

import { Budget } from '../../models/budget';

import { BudgetService } from '../../services/budget.service';


@Component({
  selector: 'modal-content',
  templateUrl: './modalContent.html'
})

export class ModalContentPage {
  month: string = '2016-12-19';
  cash: number = 25652.23;
  income: number = 1876.32;
  selectedBudget: Budget;
  budgets: Budget[];
  editing: boolean;
  reuseProjection: boolean = true;
  totalSpent: number;
  totals: any;
  mergeTotals: number;
  validationErrors: any;
  hasValidationErrors: boolean = false;
  loading: boolean = false;

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    params: NavParams,
    public toastCtrl: ToastController,
    private budgetService: BudgetService,
    public alertCtrl: AlertController
  ) {
    this.editing = params.get('editing');
    this.selectedBudget = params.get('selectedBudget');
    this.budgets = params.get('budgets');
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

  dismiss(data?) {
    if (data) {
      this.viewCtrl.dismiss(data);
    } else {
      this.viewCtrl.dismiss();
    }

  }

  removeModal(data?) {
    this.viewCtrl.dismiss(data);
  }

  tapEvent(e) {
    Keyboard.close();
  }

  showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'This will delete the item permanently.',
      buttons: [
        {
          text: 'Nope',
          handler: () => {
            console.log('Nope clicked');
          }
        },
        {
          text: 'Yup',
          handler: () => {
            console.log('Yup clicked');
            this.deleteBudget(this.selectedBudget);
          }
        }
      ]
    });
    confirm.present();
  }

  setToPrevBudget() {
    this.removeModal({remove: true, chosenBudget: this.selectedBudget});
  }

  // connection function between header component & this component to create new budget
  // connected through @Output decorator
  createBudget(budget) {
    // converts the date string from 2016-10-30 to 10/30/2016
    let startDate = budget.start_period.split('-');
    let newDateString = startDate[1] + '/' + startDate[2] + '/' + startDate[0];
    let newDate = new Date(newDateString);
    budget.start_period = newDate;

    this.budgetService.addBudget(budget)
      .subscribe(data => {
        if (this.reuseProjection === false) {
        } else {
          this.reuseProjections(data);
        }

        this.reuseProjection = false;

        this.hasValidationErrors = false;

        this.showToast('Budget created!', 'bottom', 'toaster-green');
        console.log('Budget created!');
        this.removeModal(data);
      }, err => {
        this.handleError(err);
        console.error(err);
      });
  }

  // reuse projections from last budget
  reuseProjections(budget) {
    let prevProjection;

    // get the budget items
    prevProjection = this.obtainPreviousBudget('post');

    budget.budget_items = prevProjection.budget_items;

    // update the new budget with last period's budget items
    this.budgetService.updateBudgetById(budget._id, budget)
      .subscribe(data => {
        console.log('data', data);
      }, err => {
        this.handleError(err);
        console.error(err);
      });
  }

  // get the projection or budget items from last period
  obtainPreviousBudget(string) {
    let budgetItems;
    let prevBudget;

    // loop through each budget item
    for (let i = 0; i < this.budgets.length; i++) {
      // find the budget that was created last week
      if (string === 'post') {
        if (i === (this.budgets.length - 2)) {
          // assign the last budget to shownBudget variable
          budgetItems = this.budgets[i];
        }
      } else if (string === 'pre') {
        if (i === (this.budgets.length - 1)) {
          // assign the last budget to shownBudget variable
          budgetItems = this.budgets[i];
        }
      }
    }

    // use a hack to make a deep copy of an array
    prevBudget = JSON.parse(JSON.stringify(budgetItems));

    prevBudget.total_spent = this.getActualTotals(prevBudget.budget_items);

    // loop through to remove all the actual values
    for (let i = 0; i < prevBudget.budget_items.length; i++) {
      prevBudget.budget_items[i].actual = [];
    }

    // return the new budget_items array to use in the new budget
    return prevBudget;
  }

  getActualTotals(budgetItems) {
    // initialize totalSpent to 0
    this.totalSpent = 0;
    // initialize totals variable to empty array
    this.totals = [];
    // initialize mergeTotals to 0
    this.mergeTotals = 0;

    // loop through each item in budget_items
    for (let i = 0; i < budgetItems.length; i++) {
      let item = budgetItems[i];
      // for each budget_item, loop through the actual array
      for (let j = 0; j < item.actual.length; j++) {
        if (item.actual[j].expense === true) {
          // add amount to totalSpent
          this.totalSpent += +item.actual[j].amount;
        } else {
          // subtract amount to totalSpent
          this.totalSpent -= +item.actual[j].amount;
        }
      }
    }

    // push totalSpent total to totals array
    this.totals.push(this.totalSpent);

    // loop through the totals array
    for (let i = 0; i < this.totals.length; i++) {
      // merge the total together
      this.mergeTotals += +this.totals[i];
    }
    return this.mergeTotals;
  }

  addUpdate(budget) {
    // update the new budget with last period's budget items
    this.budgetService.updateBudgetById(budget._id, budget)
      .subscribe(data => {
        this.dismiss(budget);

        this.showToast('Budget updated!', 'bottom', 'toaster-green');
      }, err => {
        this.handleError(err);
        console.error(err);
      });
  }

  deleteBudget(budget) {
    this.budgetService.deleteBudgetById(budget._id)
      .subscribe(data => {
        let newIndex = 0;

        this.budgets.filter((item, i) => {
          if (item._id === budget._id) {
            this.budgets.splice(i, 1);
            newIndex = i - 1;
          }
        });

        if (this.budgets.length > 0) {
          this.selectedBudget = this.budgets[newIndex];
          this.dismiss(this.selectedBudget);
        } else {
          this.dismiss('no budgets');
        }

        this.showToast('Budget deleted!', 'bottom', 'toaster-green');
      }, err => {
        this.handleError(err);
        console.error(err);
      });
  }

  private handleError(error: any) {
    // if the error has status 400 meaning there are form issues
    if (error.status === 400) {
      // tell user to fix the form issues
      this.showToast('Form Errors\nPlease see above.', 'bottom', 'toaster-red');
      console.log('response', error);
      this.hasValidationErrors = true;
      this.validationErrors = error;
    } else {
      // else display the message to the user
      let message = error && error.statusText;

      if (message) {
        this.showToast('Uh oh! ' + message, 'bottom', 'toaster-red');
      } else {
        message = 'Please try again.';
        this.showToast('Unexpected Error! ' + message, 'bottom', 'toaster-red');
      }

      // log the entire response to the console
      console.error(error);
    }
  }
}

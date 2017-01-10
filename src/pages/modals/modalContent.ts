import { Component } from '@angular/core';

import { Platform, ViewController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { Keyboard } from 'ionic-native';

import { Budget, ActualItems } from '../../models/budget';

import { BudgetService } from '../../services/budget.service';

import createNumberMask from 'text-mask-addons/dist/createNumberMask.js'

import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { AuthData } from '../../providers/auth-data';

// First, you need to create the `numberMask` with your desired configurations
const numberMask = createNumberMask({
  allowDecimal: true
});


@Component({
  selector: 'modal-content',
  templateUrl: './modalContent.html'
})

export class ModalContentPage {
  allBudgets: FirebaseListObservable<any>;
  currentUser: any;
  selectedBudget: Budget;
  lastBudget: Budget;
  budgets: Budget[];
  reuseProjectionsBudget: Budget;
  editing: boolean;
  reuseProjection: boolean = true;
  totalSpent: number;
  totals: any;
  mergeTotals: number;
  validationErrors: any;
  hasValidationErrors: boolean = false;
  loading: boolean = false;

  existingCashString: string;
  currentIncomeString: string;

  mask = numberMask;

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    public params: NavParams,
    public toastCtrl: ToastController,
    private budgetService: BudgetService,
    public alertCtrl: AlertController,
    public authData: AuthData,
    af: AngularFire
  ) {
    this.editing = params.get('editing');
    this.selectedBudget = params.get('selectedBudget');
    this.budgets = params.get('budgets');
    console.log(params.get('budgets'));

    this.currentUser = this.authData.getUserInfo();
    this.allBudgets = af.database.list('/users/' + this.currentUser.uid + '/budgets');
  }

  ngOnInit() {
    this.convertNumberToString();
  }

  convertNumberToString() {
    this.existingCashString = '$' + this.selectedBudget.existing_cash.toFixed(2).replace(/./g, function(c, i, a) {
      return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
    });
    this.currentIncomeString = '$' + this.selectedBudget.current_income.toFixed(2).replace(/./g, function(c, i, a) {
      return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
    });
  }

  convertStringToNumber() {
    let existingCashSplit = this.existingCashString.split('$');
    let existingCashString = existingCashSplit[1].replace(/,/g, '');
    this.selectedBudget.existing_cash = +existingCashString;

    let currentIncomeSplit = this.currentIncomeString.split('$');
    let currentIncomeString = currentIncomeSplit[1].replace(/,/g, '');
    this.selectedBudget.current_income = +currentIncomeString;
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
    if (data) {
      this.viewCtrl.dismiss(data);
    } else {
      this.viewCtrl.dismiss();
    }
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
    let newDate = new Date(newDateString).toISOString();
    budget.start_period = newDate;
    this.convertStringToNumber();

    if (this.reuseProjection === false) {
      this.allBudgets.push(budget).then(() => {


        this.reuseProjection = false;

        this.hasValidationErrors = false;

        this.showToast('Budget created!', 'bottom', 'toaster-green');
        console.log('Budget created!');
        this.removeModal();
      });
    } else {
      budget.budget_items = this.reuseProjections();
      console.log('here is the budget', budget);
      this.allBudgets.push(budget).then(() => {

        this.reuseProjection = false;

        this.hasValidationErrors = false;

        this.showToast('Budget created!', 'bottom', 'toaster-green');
        console.log('Budget created!');
        this.removeModal();
      });
    }

    // this.budgetService.addBudget(budget)
    //   .subscribe(data => {
    //     console.log('data', data);
    //
    //     if (this.reuseProjection === false) {
    //     } else {
    //       this.reuseProjections(data);
    //     }
    //
    //     this.reuseProjection = false;
    //
    //     this.hasValidationErrors = false;
    //
    //     this.showToast('Budget created!', 'bottom', 'toaster-green');
    //     console.log('Budget created!');
    //     this.removeModal(data);
    //   }, err => {
    //     this.handleError(err);
    //     console.error(err);
    //   });
  }

  // reuse projections from last budget
  reuseProjections() {
    let prevProjection;

    // // loop through each budget entry
    // for (let i = 0; i < this.budgets.length; i++) {
    //   // find the latest created budget entry in the array
    //   if (i === (this.budgets.length - 2)) {
    //     // make that one the selected budget on load
    //     this.lastBudget = this.budgets[i];
    //     // this.averageSaving = this.getAverageSaving(this.budgets);
    //   }
    // }

    // get the budget items
    prevProjection = this.obtainPreviousBudget('post');

    console.log('previous budget', prevProjection.budget_items);

    return prevProjection.budget_items;

    // this.selectedBudget.updatedAt = (new Date()).toISOString();

    // this.allBudgets.update(this.selectedBudget.$key, this.selectedBudget);

    // // update the new budget with last period's budget items
    // this.budgetService.updateBudgetById(budget._id, budget)
    //   .subscribe(data => {
    //     console.log('data', data);
    //     this.reuseProjectionsBudget = data;
    //   }, err => {
    //     this.handleError(err);
    //     console.error(err);
    //   });
  }

  // get the projection or budget items from last period
  obtainPreviousBudget(string) {
    let budgetItems;
    let prevBudget;

    // loop through each budget item
    for (let i = 0; i < this.budgets.length; i++) {
      // find the budget that was created last week
      if (string === 'post') {
        if (i === (this.budgets.length - 1)) {
          // assign the last budget to shownBudget variable
          budgetItems = this.budgets[i];
          console.log('budget item before', budgetItems);
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

    // loop through to remove all the actual values
    for (let i = 0; i < prevBudget.budget_items.length; i++) {
      prevBudget.budget_items[i].actual = [];
      prevBudget.budget_items[i].actual.push(new ActualItems());
    }

    // return the new budget_items array to use in the new budget
    return prevBudget;
  }

  addUpdate(budget) {
    this.convertStringToNumber();
    console.log('budget', budget);
    // update the new budget with last period's budget items
    this.budgetService.updateBudgetById(budget._id, budget)
      .subscribe(data => {
        console.log('data', data);
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

        console.log('Budget deleted');
        this.showToast('Budget deleted!', 'bottom', 'toaster-green');
      }, err => {
        this.handleError(err);
        console.error(err);
      });
  }

  // todo: add tests for error handler

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

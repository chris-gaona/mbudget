import { Component } from '@angular/core';

import { Platform, ViewController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { Budget, ActualItems } from '../../models/budget';

import createNumberMask from 'text-mask-addons/dist/createNumberMask.js';

import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { AuthData } from '../../providers/auth-data';

import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { LocalNotifications } from 'ionic-native';

import { CurrencyValidator } from '../../validators/currency';

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

  budgetForm: FormGroup;
  submitAttempt: boolean = false;
  dateChanged: boolean = false;
  existingChanged: boolean = false;
  currentChanged: boolean = false;

  constructor(
    public platform: Platform,
    public formBuilder: FormBuilder,
    public viewCtrl: ViewController,
    public params: NavParams,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public authData: AuthData,
    af: AngularFire
  ) {
    this.editing = params.get('editing');
    this.selectedBudget = params.get('selectedBudget');
    this.budgets = params.get('budgets');

    this.currentUser = this.authData.getUserInfo();
    this.allBudgets = af.database.list('/users/' + this.currentUser.uid + '/budgets');

    this.budgetForm = formBuilder.group({
      date: ['', Validators.compose([Validators.required])],
      existing: ['', Validators.compose([Validators.required, CurrencyValidator.isValid])],
      current: ['', Validators.compose([Validators.required, CurrencyValidator.isValid])],
      reuse: ['']
    });
  }

  ngOnInit() {
    this.convertNumberToString();

    this.budgetForm.controls['date'].setValue(this.selectedBudget.start_period, { onlySelf: true });
    this.budgetForm.controls['existing'].setValue(this.existingCashString, { onlySelf: true });
    this.budgetForm.controls['current'].setValue(this.currentIncomeString, { onlySelf: true });
  }

  checkWhichFunction() {
    this.submitAttempt = true;

    if (!this.budgetForm.valid) {
      console.log(this.budgetForm.value);
      // this.loading.dismiss();
    } else {
      console.log('current cash', this.budgetForm.value.current);

      if (this.editing) {
        this.addUpdate(this.selectedBudget);
      } else {
        this.createBudget(this.selectedBudget);
      }
    }
  }

  convertNumberToString() {
    this.existingCashString = '$' + this.selectedBudget.existing_cash.toFixed(2).replace(/./g, function(c, i, a) {
      return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
    });
    this.currentIncomeString = '$' + this.selectedBudget.current_income.toFixed(2).replace(/./g, function(c, i, a) {
      return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
    });
  }

  convertStringToNumber(string) {
    let currentIncomeSplit = string.split('$');
    let currentIncomeString = currentIncomeSplit[1].replace(/,/g, '');
    return +currentIncomeString;
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

  elementChanged(input){
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  // connection function between header component & this component to create new budget
  // connected through @Output decorator
  createBudget(budget) {
    LocalNotifications.cancelAll();

    this.selectedBudget.start_period = this.budgetForm.value.date;
    this.selectedBudget.existing_cash = this.convertStringToNumber(this.budgetForm.value.existing);
    this.selectedBudget.current_income = this.convertStringToNumber(this.budgetForm.value.current);

    if (this.reuseProjection === false) {
      this.allBudgets.push(budget).then(() => {


        this.reuseProjection = false;

        this.hasValidationErrors = false;

        this.showToast('Budget created!', 'bottom', 'toaster-green');
        console.log('Budget created!');

        LocalNotifications.cancelAll();

        this.removeModal();
      });
    } else {
      budget.budget_items = this.reuseProjections();

      this.allBudgets.push(budget).then(() => {

        this.reuseProjection = false;

        this.hasValidationErrors = false;

        LocalNotifications.cancelAll();

        this.showToast('Budget created!', 'bottom', 'toaster-green');
        console.log('Budget created!');
        this.removeModal();
      });
    }
  }

  // reuse projections from last budget
  reuseProjections() {
    let prevProjection;

    // get the budget items
    prevProjection = this.obtainPreviousBudget('post');

    return prevProjection.budget_items;
  }

  // get the projection or budget items from last period
  obtainPreviousBudget(string) {
    let budgetItems;
    let prevBudget;

    // loop through each budget item
    for (let i = 0; i < this.budgets.length; i++) {
      // find the budget that was created last week
      if (i === (this.budgets.length - 2)) {
        // assign the last budget to shownBudget variable
        budgetItems = this.budgets[i];
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
    this.selectedBudget.start_period = this.budgetForm.value.date;
    this.selectedBudget.existing_cash = this.convertStringToNumber(this.budgetForm.value.existing);
    this.selectedBudget.current_income = this.convertStringToNumber(this.budgetForm.value.current);

    let chosenBudgetKey = budget.$key;

    delete budget.$key;
    delete budget.$exists;

    budget.updatedAt = (new Date).toISOString();

    this.allBudgets.update(chosenBudgetKey, budget).then(() => {
      this.showToast('Budget updated!', 'bottom', 'toaster-green');
    });

    this.dismiss(budget);
  }

  deleteBudget(budget) {
    let chosenBudgetKey = budget.$key;

    delete budget.$key;
    delete budget.$exists;

    this.allBudgets.remove(chosenBudgetKey).then(() => {
      console.log('Budget deleted');
      this.showToast('Budget deleted!', 'bottom', 'toaster-red');
    });

    if (this.budgets.length === 1) {
      this.dismiss('no budgets');
    } else {
      this.dismiss();
    }
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

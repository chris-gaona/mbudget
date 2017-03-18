// import statements
import { Component } from '@angular/core';
import { Platform, ViewController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { Budget, ActualItems } from '../../models/budget';
import createNumberMask from 'text-mask-addons/dist/createNumberMask.js';
import { AuthData } from '../../providers/auth-data';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { LocalNotifications } from 'ionic-native';
import { CurrencyValidator } from '../../validators/currency';


// create the `numberMask` with desired configurations
const numberMask = createNumberMask({
  allowDecimal: true
});


@Component({
  selector: 'modal-content',
  templateUrl: './modalContent.html'
})

export class ModalContentPage {
  // init variables
  selectedBudget: Budget;
  budgets: any;
  reuseProjectionsBudget: Budget;
  reuseProjection: boolean = true;
  editing: boolean;
  totalSpent: number;
  totals: any;
  mergeTotals: number;
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
    private authData: AuthData
  ) {
    // assign data sent from home component
    this.editing = params.get('editing');
    this.selectedBudget = params.get('selectedBudget');
    this.budgets = params.get('budgets');

    // initialize budgetForm
    this.budgetForm = formBuilder.group({
      date: ['', Validators.compose([Validators.required])],
      existing: ['', Validators.compose([Validators.required, CurrencyValidator.isValid])],
      current: ['', Validators.compose([Validators.required, CurrencyValidator.isValid])]
    });
  }

  ////////////////
  // LIFECYCLE FUNCTIONS
  ////////////////

  ngAfterViewInit() {
    // must add the following after view init otherwise
    // there is a bug with text-mask
    // https://github.com/text-mask/text-mask/issues/323
    this.convertNumberToString();

    // set budget data to form
    this.budgetForm.controls['date'].setValue(this.selectedBudget.start_period);
    this.budgetForm.controls['existing'].setValue(this.existingCashString);
    this.budgetForm.controls['current'].setValue(this.currentIncomeString);
  }

  ////////////////
  // UTILITY FUNCTIONS
  ////////////////

  errorHandler(err) {
    // display error message to user
    const errorMessage: string = err.message;
    const alert = this.alertCtrl.create({
      message: errorMessage,
      buttons: [{ text: "Ok", role: 'cancel' } ]
    });

    alert.present();
  }

  // create toast for user
  showToast(message:string, position: string, color: string) {
    const toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: position,
      cssClass: color
    });

    toast.present(toast);
  }

  // show confirmation to delete entire budget
  showConfirm() {
    const confirm = this.alertCtrl.create({
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

  // dismiss modal with or without data
  dismiss(data?) {
    if (data) {
      this.viewCtrl.dismiss(data);
    } else {
      this.viewCtrl.dismiss();
    }
  }

  // converts the number to a string...it's used for masking
  convertNumberToString() {
    this.existingCashString = '$' + this.selectedBudget.existing_cash.toFixed(2).replace(/./g, function(c, i, a) {
        return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
      });
    this.currentIncomeString = '$' + this.selectedBudget.current_income.toFixed(2).replace(/./g, function(c, i, a) {
        return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
      });
  }

  // converts string back to number to save on firebase
  convertStringToNumber(string) {
    const currentIncomeSplit = string.split('$');
    const currentIncomeString = currentIncomeSplit[1].replace(/,/g, '');
    return +currentIncomeString;
  }

  // Receives an input field and sets the corresponding
  // fieldChanged property to 'true' to help with the styles
  elementChanged(input){
    const field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  // toggles reuseProjection variable with ionic checkbox
  checkboxChanged(event) {
    this.reuseProjection = !this.reuseProjection;
  }

  ////////////////
  // CORE FUNCTIONS
  ////////////////

  // check for which function to use
  checkWhichFunction() {
    this.submitAttempt = true;

    if (!this.budgetForm.valid) {
      console.log(this.budgetForm.value);
    } else {
      if (this.editing) {
        this.addUpdate();
      } else {
        this.createBudget();
      }
    }
  }

  // create a new budget
  createBudget() {
    // cancel all previous budget notifications
    // when creating new budget
    LocalNotifications.cancelAll();

    // sets selectedBudget formatting for form
    this.selectedBudget.start_period = this.budgetForm.value.date;
    this.selectedBudget.existing_cash = this.convertStringToNumber(this.budgetForm.value.existing);
    this.selectedBudget.current_income = this.convertStringToNumber(this.budgetForm.value.current);

    // check if reuse projection is true or false
    if (this.reuseProjection) {
      // newly created budget while reusing last period's projections
      this.selectedBudget.budget_items = this.reuseProjections();
    }

    // push newly created budget to firebase
    this.authData.getBudgets().push(this.selectedBudget).then(() => {

      this.hasValidationErrors = false;

      this.showToast('Budget created!', 'bottom', 'toaster-green');

      this.dismiss();
    }, this.errorHandler);
  }

  // get the projection or budget items from last period
  reuseProjections() {
    let budgetItems;
    let prevBudget;

    // loop through each budget item
    for (let i = 0; i < this.budgets.length; i++) {
      // find the budget that was created last week
      if (i === (this.budgets.length - 1)) {
        // assign the last budget to shownBudget variable
        budgetItems = this.budgets[i];
      }
    }

    // use a hack to make a deep copy of an array
    prevBudget = JSON.parse(JSON.stringify(budgetItems));

    // loop through to remove all the actual values
    for (let i = 0; i < prevBudget.budget_items.length; i++) {
      prevBudget.budget_items[i].due = false;
      prevBudget.budget_items[i].due_date = null;
      prevBudget.budget_items[i].paid = false;
      prevBudget.budget_items[i].projection = +prevBudget.budget_items[i].projection;
      prevBudget.budget_items[i].actual = [];
      prevBudget.budget_items[i].actual.push(new ActualItems());
    }

    // return the new budget_items array to use in the new budget
    return prevBudget.budget_items;
  }

  // edit existing budget
  addUpdate() {
    this.selectedBudget.start_period = this.budgetForm.value.date;
    this.selectedBudget.existing_cash = this.convertStringToNumber(this.budgetForm.value.existing);
    this.selectedBudget.current_income = this.convertStringToNumber(this.budgetForm.value.current);

    const chosenBudgetKey = this.selectedBudget.$key;

    this.selectedBudget.updatedAt = (new Date).toISOString();

    // update specific budget item
    this.authData.getBudgets().update(chosenBudgetKey, this.selectedBudget).then(() => {
      this.showToast('Budget updated!', 'bottom', 'toaster-green');
    }, this.errorHandler);

    this.dismiss(this.selectedBudget);
  }

  // delete entire budget
  deleteBudget(budget) {
    const chosenBudgetKey = budget.$key;

    // remove the specific budget
    this.authData.getBudgets().remove(chosenBudgetKey).then(() => {
      this.dismiss();

      this.showToast('Budget deleted!', 'bottom', 'toaster-red');
    }, this.errorHandler);
  }
}

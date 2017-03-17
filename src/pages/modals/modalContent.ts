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
  currentUser: any;
  selectedBudget: Budget;
  budgets: Budget[];
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
    public authData: AuthData
  ) {
    // assign data sent from home component
    this.editing = params.get('editing');
    this.selectedBudget = params.get('selectedBudget');
    this.budgets = params.get('budgets');

    this.currentUser = this.authData.getUserInfo();
    // this.allBudgets = af.database.list('/users/' + this.currentUser.uid + '/budgets');

    // initialize budgetForm
    this.budgetForm = formBuilder.group({
      date: ['', Validators.compose([Validators.required])],
      existing: ['', Validators.compose([Validators.required, CurrencyValidator.isValid])],
      current: ['', Validators.compose([Validators.required, CurrencyValidator.isValid])]
    });
  }

  ngOnInit() {
    console.log('budgets', this.budgets);
    console.log('selectedBudget', this.selectedBudget);
    console.log('editing boolean', this.editing);
  }

  ngAfterViewInit() {
    this.convertNumberToString();

    // set budget data to form
    this.budgetForm.controls['date'].setValue(this.selectedBudget.start_period);
    this.budgetForm.controls['existing'].setValue(this.existingCashString);
    this.budgetForm.controls['current'].setValue(this.currentIncomeString);

    console.log('check out the budget form', this.budgetForm.value);
  }

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
    let currentIncomeSplit = string.split('$');
    let currentIncomeString = currentIncomeSplit[1].replace(/,/g, '');
    return +currentIncomeString;
  }

  // create toast for user
  showToast(message:string, position: string, color: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: position,
      cssClass: color
    });

    toast.present(toast);
  }

  // dismiss modal with or without data
  dismiss(data?) {
    if (data) {
      this.viewCtrl.dismiss(data);
    } else {
      this.viewCtrl.dismiss();
    }
  }

  // remove modal with or without data
  removeModal(data?) {
    if (data) {
      this.viewCtrl.dismiss(data);
    } else {
      this.viewCtrl.dismiss();
    }
  }

  // show confirmation to delete entire budget
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
    // this.removeModal({remove: true, chosenBudget: this.selectedBudget});
    this.removeModal();
  }

  /**
   * Receives an input field and sets the corresponding fieldChanged property to 'true' to help with the styles.
   */
  elementChanged(input){
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  checkboxChanged(event) {
    this.reuseProjection = !this.reuseProjection;
    console.log('reuse projection', this.reuseProjection);
  }

  // connection function between header component & this component to create new budget
  // connected through @Output decorator
  createBudget() {
    // cancel all previous budgets when creating new budget
    LocalNotifications.cancelAll();

    this.selectedBudget.start_period = this.budgetForm.value.date;
    this.selectedBudget.existing_cash = this.convertStringToNumber(this.budgetForm.value.existing);
    this.selectedBudget.current_income = this.convertStringToNumber(this.budgetForm.value.current);

    console.log('budget to create', this.selectedBudget);

    // newly created budget without reusing last period's projections
    if (!this.reuseProjection) {
      // push newly created budget to firebase
        this.authData.getBudgets().push(this.selectedBudget).then(() => {

        this.hasValidationErrors = false;

        this.showToast('Budget created!', 'bottom', 'toaster-green');

        this.removeModal();
      }, (err) => {
        console.log(err);
        // display error message to user
        let errorMessage: string = err.message;
        let alert = this.alertCtrl.create({
          message: errorMessage,
          buttons: [{ text: "Ok", role: 'cancel' } ]
        });

        alert.present();
      });

    } else {
      // newly created budget while reusing last period's projections
      this.selectedBudget.budget_items = this.reuseProjections();

      this.authData.getBudgets().push(this.selectedBudget).then(() => {

        this.hasValidationErrors = false;

        this.showToast('Budget created!', 'bottom', 'toaster-green');

        this.removeModal();
      }, (err) => {
        console.log(err);
        // display error message to user
        let errorMessage: string = err.message;
        let alert = this.alertCtrl.create({
          message: errorMessage,
          buttons: [{ text: "Ok", role: 'cancel' } ]
        });

        alert.present();
      });
    }
  }

  // get the projection or budget items from last period
  reuseProjections() {
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

    let chosenBudgetKey = this.selectedBudget.$key;

    this.selectedBudget.updatedAt = (new Date).toISOString();

    // update specific budget item
    this.authData.getBudgets().update(chosenBudgetKey, this.selectedBudget).then(() => {
      this.showToast('Budget updated!', 'bottom', 'toaster-green');
    }, (err) => {
      console.log(err);
      // display error message to user
      let errorMessage: string = err.message;
      let alert = this.alertCtrl.create({
        message: errorMessage,
        buttons: [{ text: "Ok", role: 'cancel' } ]
      });

      alert.present();
    });

    this.dismiss(this.selectedBudget);
  }

  // delete entire budget
  deleteBudget(budget) {
    let chosenBudgetKey = budget.$key;

    // remove the specific budget
    this.authData.getBudgets().remove(chosenBudgetKey).then(() => {
      this.dismiss();

      this.showToast('Budget deleted!', 'bottom', 'toaster-red');
    }, (err) => {
      console.log(err);
      // display the error message to the user
      let errorMessage: string = err.message;
      let alert = this.alertCtrl.create({
        message: errorMessage,
        buttons: [{ text: "Ok", role: 'cancel' } ]
      });

      alert.present();
    });
  }
}

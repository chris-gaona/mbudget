// import statements
import { Component } from '@angular/core';
import {
  NavController, NavParams, AlertController, ToastController, PopoverController, Platform
} from 'ionic-angular';
import { ActualItems, Budget, BudgetItems } from '../../models/budget';
import { AuthData } from '../../providers/auth-data';
import { PopoverDueDatePage } from '../popovers/dueDate';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { CurrencyValidator } from '../../validators/currency';
import { LocalNotifications } from 'ionic-native';
import * as moment from 'moment';


@Component({
  selector: 'page-edit',
  templateUrl: './edit.html'
})
export class EditPage {
  // initialize variables
  budget: Budget;
  item: BudgetItems;
  hasValidationErrors: boolean = false;
  totalActual: number;
  loading: boolean = false;
  saveAllData: Budget;
  errorMessage: any;
  notification: any;
  // form info
  editForm: FormGroup;
  submitAttempt: boolean = false;
  formChanges: any;

  constructor(public navCtrl: NavController,
              private formBuilder: FormBuilder,
              public platform: Platform,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              private navParams: NavParams,
              public popoverCtrl: PopoverController,
              public authData: AuthData) {
    // get data from navParams sent from home component
    this.budget = navParams.get('budget');
    this.item = navParams.get('budgetItem');
  }

  ////////////////
  // LIFECYCLE FUNCTIONS
  ////////////////

  ngOnInit() {
    // initialize form here...could also initialize in the constructor
    this.editForm = this.formBuilder.group({
      itemName: [this.item.item, [Validators.required]],
      projection: [this.item.projection, [Validators.required, CurrencyValidator.isValid]],
      actuals: this.formBuilder.array([
        // calls function to initialize a form within a form for actuals
        this.initActual()
      ])
    });

    // populates the actual items into the form to be edited by user
    this.populateActual();

    // subscribes to the form changes in order to update ui properly
    this.formChanges = this.editForm.valueChanges.subscribe(data => {
      this.item.item = this.editForm.value.itemName;
      this.item.projection = this.editForm.value.projection;
      this.item.actual = this.editForm.value.actuals;
    })
  }

  ngOnDestroy() {
    this.formChanges.unsubscribe();
  }

  ////////////////
  // UTILITY FUNCTIONS
  ////////////////

  errorHandler(err) {
    // if error display an alert to the user with the error message
    const errorMessage: string = err.message;
    const alert = this.alertCtrl.create({
      message: errorMessage,
      buttons: [{text: "Ok", role: 'cancel'}]
    });

    alert.present();
  }

  // creates toast message to inform user of changes
  showToast(message:string, position: string, color: string) {
    const toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: position,
      cssClass: color
    });

    toast.present(toast);
  }

  // creates popover when user clicks that they want to create a due date for item
  presentPopover(ev) {
    // if there is an item due
    if (this.item.due === true) {
      const popover = this.popoverCtrl.create(PopoverDueDatePage, {budgetItem: this.item});

      popover.present({
        ev: ev
      });
    } else {
      this.item.due_date = null;
    }
  }

  // initialize the form for actual items within editForm
  initActual() {
    return this.formBuilder.group({
      name: [this.item.actual[0].name, []],
      amount: [this.item.actual[0].amount, [Validators.required, CurrencyValidator.isValid]],
      expense: [this.item.actual[0].expense, []]
    });
  }

  // populate the actual form with the actual items for user to edit
  populateActual() {
    for (let i = 1; i < this.item.actual.length; i++) {
      // add address to the list
      const control = <FormArray>this.editForm.controls['actuals'];
      control.push(this.formBuilder.group({
        name: [this.item.actual[i].name, []],
        amount: [this.item.actual[i].amount, [Validators.required, CurrencyValidator.isValid]],
        expense: [this.item.actual[i].expense, []]
      }));
    }
  }

  // capitalize the first letter of each word
  capitalizeFirstLetter(str) {
    return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  // removes edit component to go back to home component
  goBack() {
    this.navCtrl.pop();
  }

  toggleAddSubtract(actual) {
    actual.expense = !actual.expense;
  }

  // parses data for due date
  parseDate(date: any) {
    return moment().to(date);
  }

  ////////////////
  // CORE FUNCTIONS
  ////////////////

  // save all edits
  saveAll() {
    this.submitAttempt = true;

    // if on cordova platform...log all notification items to console
    if(this.platform.is('cordova')) {
      LocalNotifications.getAllTriggered().then((data) => {
        console.log('data', data);
      });
    }

    // if the form is invalid simply log the form data to the console
    if (!this.editForm.valid) {
      console.log(this.editForm.value);
      // show toast for validation errors
      this.showToast('Form validation error(s)', 'bottom', 'toaster-red');

      // else if form is valid
    } else {

      const chosenBudgetKey = this.budget.$key;

      // assign values from form to item object
      this.item.item = this.editForm.value.itemName;
      this.item.projection = +this.editForm.value.projection;

      // make sure each actual amount is coerced into a number value using + operator
      for (let item of this.editForm.value.actuals) {
        item.amount = +item.amount;
      }

      // assign actual values to item object
      this.item.actual = this.editForm.value.actuals;
      // add updatedAt to specific budget
      this.budget.updatedAt = (new Date).toISOString();

      // update budget within all budgets to updated data
      this.authData.getBudgets().update(chosenBudgetKey, this.budget).then(() => {
        // add notification if a due date was created by user
        if (this.item.due === true) {
          this.addNotifications();
        }

        // lastly, show the toast
        this.showToast('Everything saved!', 'bottom', 'toaster-green');

      }, this.errorHandler);

      // then go back to home component
      this.goBack();
    }
  }

  // display alert to delete some items
  showCheckbox() {
    const alert = this.alertCtrl.create();
    alert.setTitle('Which to delete?');

    // adds main projection item to delete the whole thing
    alert.addInput({
      type: 'checkbox',
      label: this.capitalizeFirstLetter(this.item.item) + ' (MAIN)',
      value: this.item.item
    });

    for (let item of this.item.actual) {
      alert.addInput({
        type: 'checkbox',
        label: this.capitalizeFirstLetter(item.name) + ' $' + item.amount,
        value: item.name  + ' $' + item.amount
      });
    }

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Delete',
      handler: data => {
        // use .filter on array here
        for (let item of data) {
          if (item === this.item.item) {
            this.deleteBudgetItem(item);
          } else {
            this.deleteActual(this.item, item);
          }
        }
      }
    });
    alert.present();
  }

  // add new actual item to actual array under specific budget_items
  addActualItem(actual) {
    // create a new actual item using the defined types
    const newActualItem = new ActualItems();
    // add that item to the array
    actual.push(newActualItem);

    // call populateActual function to populate ui with new
    // actual item
    this.populateActual();
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

    this.ngOnInit();
  }

  // delete specific budget item
  deleteBudgetItem(budgetItem) {
    const budget = this.budget.budget_items;
    // loop through budget_items
    for (let i = 0; i < budget.length; i++) {
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

  // creates the notification based on the due date set
  addNotifications() {
    let d = new Date(this.item.due_date);
    d.setDate(d.getDate() - 1);

    this.notification = {
      id: Date.parse(this.item.due_date),
      title: 'Reminder from BudTrac!',
      text: this.item.item + ' is due soon :)',
      at: d,
      every: 'year'
    };

    console.log("Notification to be scheduled: ", this.notification);

    if (this.platform.is('cordova')) {

      // Cancel existing notification
      LocalNotifications.cancel(Date.parse(this.item.due_date)).then(() => {

        // Schedule the new notifications
        LocalNotifications.schedule(this.notification);

      });
    }
  }
}

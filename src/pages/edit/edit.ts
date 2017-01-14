import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController, PopoverController } from 'ionic-angular';

import { ActualItems, Budget, BudgetItems } from '../../models/budget';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { AuthData } from '../../providers/auth-data';
import { PopoverDueDatePage } from '../popovers/dueDate';

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
              public popoverCtrl: PopoverController,
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

  presentPopover(ev) {
    if (this.item.due === true) {
      let popover = this.popoverCtrl.create(PopoverDueDatePage, {budgetItem: this.item});

      popover.present({
        ev: ev
      });
    } else {
      this.item.due_date = null;
    }
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

  parseDate(date: any) {
    // parses a string representation of a date, &
    // returns the number of milliseconds since
    // January 1, 1970
    let systemDate: any = Date.parse(date);
    // gets today's date
    let convertDate: any = this.convertDate(new Date());
    let userDate: any = new Date(convertDate);
    // splits date string at space into array with
    // each word
    // has to add 2 days as a hack to get this to display the correct date
    // converting from ISO String
    let convertingDate: any = new Date(this.convertDate(new Date(date), 2)).toDateString();
    // let dateToSplit: any = new Date(convertingDate).toDateString();
    // console.log('date to split', dateToSplit);
    let splitDate: any = convertingDate.split(' ');
    // gets difference between twitter date & user date
    // divide the value by 1000 to change milliseconds
    // into seconds
    let diff = Math.floor((systemDate - userDate) / 1000);

    // adds text depending on how many seconds the diff is
    // booleanValue is used to deterime to put text in
    // timeline section or direct messages section

    if (convertDate === this.convertDate(new Date(date), 1)) { return 'Due today'; }

    if (diff <= 129600) { return 'Due tomorrow'; }

    if (diff < 604800) { return 'Due in ' + Math.round(diff / 86400) + ' days'; }

    if (diff <= 777600) { return 'Due in 1 week'; }

    // if none of the above return true show actual date
    return 'Due on ' + splitDate[1] + ' ' + splitDate[2];
  }

  // converts date string to 2016-10-29
  convertDate(date, days?) {
    // let date = new Date();

    if (days) {
      date.setTime( date.getTime() + days * 86400000 );
    }


    let dateString;

    if ((date.getMonth() + 1) < 10 && date.getDate() < 10) {
      dateString = date.getFullYear() + '-0' + (date.getMonth() + 1) + '-0' + date.getDate();

    } else if ((date.getMonth() + 1) < 10 && date.getDate() >= 10) {
      dateString = date.getFullYear() + '-0' + (date.getMonth() + 1) + '-' + date.getDate();

    } else if ((date.getMonth() + 1) >= 10 && date.getDate() < 10) {
      dateString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-0' + date.getDate();

    } else {
      dateString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }
    // converts new date to proper string to be handled by date type input
    return dateString;
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

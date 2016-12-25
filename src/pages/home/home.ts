import { Component } from '@angular/core';

import { ModalController, NavController, PopoverController, AlertController } from 'ionic-angular';

import { PopoverPage } from '../popovers/userInfo';
import { ModalContentPage } from '../modals/modalContent';
import { EditPage } from '../edit/edit';
import { UserService } from '../../services/user.service';
import { ModalAuthPage } from '../modals/modalAuth';
import { BudgetService } from '../../services/budget.service';
import { Budget, BudgetItems } from '../../models/budget';

@Component({
  selector: 'page-home',
  templateUrl: './home.html'
})
export class HomePage {

  budgets: Budget[];
  selectedBudget: Budget;
  currentUser: string;
  visibleBudgets: boolean;
  totalSpent: number;
  totals: any;
  mergeTotals: number;
  totalSaving: number;
  percSaving: number;
  endingCash: number;
  projectionObject: Object = {};
  actualObject: Object = {};
  edited: boolean = false;

  projActual:string = 'actual';

  constructor(public navCtrl: NavController, public popoverCtrl: PopoverController, public modalCtrl: ModalController, public alertCtrl: AlertController, private userService: UserService, private budgetService: BudgetService) {

  }

  ngOnInit() {
    this.checkUserAuth();
  }

  checkUserAuth () {
    if (!this.userService.isLoggedIn()) {
      this.openAuthModal();
    } else {
      this.loggedInUser();
      this.getAllBudgets();
    }
  }

  loggedInUser() {
    this.userService.getUser()
      .subscribe(data => {
        this.currentUser = data;
      }, err => {
        // this.handleError(err);
        console.log(err);
      });
  }

  getAllBudgets(editedBudget?) {
    // retrieves all budgets from budgetService
    this.budgetService.getAllBudgets()
      .subscribe(data => {
        console.log('data', data);
        if (data.length === 0) {
          this.visibleBudgets = false;
        } else {
          this.budgets = data;
          this.visibleBudgets = true;

          if (editedBudget) {

            for (let i = 0; i < this.budgets.length; i++) {
              if (this.budgets[i]._id === editedBudget._id) {
                this.selectedBudget = this.budgets[i];
              }
            }
          } else {
            // loop through each budget entry
            for (let i = 0; i < this.budgets.length; i++) {
              // find the latest created budget entry in the array
              if (i === (this.budgets.length - 1)) {
                // make that one the selected budget on load
                this.selectedBudget = this.budgets[i];
              }
            }
          }
        }
      }, err => {
        // this.handleError(err);
        console.log(err);
      });
  }

  // creates empty budget
  createEmptyBudget() {
    let newBudget = new Budget();
    this.convertDate(newBudget, newBudget.start_period);
    let previousBudget = this.obtainPreviousBudget('pre');

    newBudget.existing_cash = (previousBudget.existing_cash + previousBudget.current_income) - previousBudget.total_spent;
    newBudget.current_income = previousBudget.current_income;
    // make this new budget the shown one in the modal for editing
    this.selectedBudget = newBudget;
    this.budgets.push(this.selectedBudget);



    let modal = this.modalCtrl.create(ModalContentPage, {
      editing: false,
      selectedBudget: this.selectedBudget
    });

    modal.onDidDismiss(data => {
      let updatedBudget;

      if (data) {
        if (data.remove && data.remove === true) {
          let newIndex = 0;

          this.budgets.filter((item, i) => {
            if (item._id === this.selectedBudget._id) {
              this.budgets.splice(i, 1);
              newIndex = i - 1;
            }
          });

          if (this.budgets.length > 0) {
            updatedBudget = this.budgets[newIndex];
          }
        } else {
          updatedBudget = data;
        }
        this.getAllBudgets(updatedBudget);
      }
    });

    modal.present();
  }

  // converts date string to 2016-10-29
  convertDate(budget, date) {
    date = new Date(date);
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
    return budget.start_period = dateString;
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

  presentPopover(ev) {
    let popover = this.popoverCtrl.create(PopoverPage, {userInfo: this.currentUser});

    popover.onDidDismiss(data => {
      if (data === true) {
        this.checkUserAuth();
      }
    });

    popover.present({
      ev: ev
    });
  }

  openModalEdit() {
    let modal = this.modalCtrl.create(ModalContentPage, {
      editing: true,
      selectedBudget: this.selectedBudget,
      budgets: this.budgets
    });
    modal.onDidDismiss(data => {
      if (data) {
        this.edited = true;
        this.getAllBudgets(data);
      }
    });
    modal.present();
  }

  openModalNew() {
    this.createEmptyBudget();
  }

  openAuthModal() {
    let modal = this.modalCtrl.create(ModalAuthPage);
    modal.onDidDismiss(data => {
      this.checkUserAuth();
    });
    modal.present();
  }

  goToEditPage(_id, budget, budgetItems) {
    //push another page onto the history stack
    //causing the nav controller to animate the new page in
    this.navCtrl.push(EditPage, {
      _id: _id,
      budget: budget,
      budgetItem: budgetItems
    });
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
        }

        // this.hasValidationErrors = false;

        // this.toastr.success('Budget Deleted', 'Success!');
        //todo: add toaster here
      }, err => {
        // this.handleError(err);
        console.error(err);
      });
  }

  showConfirmation(budget, actual) {
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
            this.deleteActual(budget, actual);
          }
        }
      ]
    });
    confirm.present();
  }

  // delete specific actual item
  // pass in the specific budget_item & the actual item within that budget_item
  deleteActual(budget, actual) {
    // loop through the actual array
    for (let i = 0; i < budget.actual.length; i++) {
      // if a match to the actual passed in
      if (budget.actual[i] === actual) {
        // remove it
        budget.actual.splice(i, 1);
        this.saveAll();
      }
    }
    console.log(budget);
  }

  // save all edits
  saveAll() {
    // passes budget_items array to saveAll function on budgetService
    this.budgetService.updateBudgetById(this.selectedBudget._id, this.selectedBudget)
      .subscribe(data => {
        // todo: do something with data returned here
        // todo: add toaster here
        console.log('Everything saved!');
      }, err => {
        // this.handleError(err);
        console.log(err);
      });
  }

  // add new budget item to budget_items array in specific budget
  addBudgetItem() {
    // create a new budget item using defined types
    let newBudgetItem = new BudgetItems();
    let item;
    // // make new budget item editable to start with
    // newBudgetItem.editing = true;
    // add the new budget item to the array
    this.selectedBudget.budget_items.push(newBudgetItem);

    // loop through each budget entry
    for (let i = 0; i < this.selectedBudget.budget_items.length; i++) {
      // find the latest created budget entry in the array
      if (i === (this.selectedBudget.budget_items.length - 1)) {
        // make that one the selected budget on load
        item = this.selectedBudget.budget_items[i];
      }
    }

    this.goToEditPage(this.selectedBudget._id, this.selectedBudget, item);
  }

  // calculates total spent for entire budget
  getTotalSpent(budget, type) {
    // initialize totalSpent to 0
    this.totalSpent = 0;
    // initialize totals variable to empty array
    this.totals = [];
    // initialize mergeTotals to 0
    this.mergeTotals = 0;

    if (type === 'actual') {
      // loop through each item in budget_items
      for (let i = 0; i < budget.length; i++) {
        let item = budget[i];
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

      // total saving
      this.totalSaving = this.selectedBudget.current_income - this.mergeTotals;

      // percentage saving
      this.percSaving = this.totalSaving / this.selectedBudget.current_income;

      // ending cash amount
      this.endingCash = this.selectedBudget.existing_cash + this.selectedBudget.current_income - this.mergeTotals;

      this.actualObject = Object.assign({}, {
        totalSpent: this.mergeTotals,
        totalSaving: this.totalSaving,
        percSaving: this.percSaving,
        endingCash: this.endingCash
      });

      // return the total spent number for the entire budget
      return this.actualObject;

    } else if (type === 'projection') {
      // loop through each item in budget_items
      for (let i = 0; i < budget.length; i++) {
        this.totalSpent += +budget[i].projection;
      }

      // total saving
      this.totalSaving = this.selectedBudget.current_income - this.totalSpent;

      // percentage saving
      this.percSaving = this.totalSaving / this.selectedBudget.current_income;

      // ending cash amount
      this.endingCash = this.selectedBudget.existing_cash + this.selectedBudget.current_income - this.totalSpent;

      this.projectionObject = Object.assign({}, {
        totalSpent: this.totalSpent,
        totalSaving: this.totalSaving,
        percSaving: this.percSaving,
        endingCash: this.endingCash
      });

      return this.projectionObject;
    }
  }

  parseDate(date: string) {
    // parses a string representation of a date, &
    // returns the number of milliseconds since
    // January 1, 1970
    let systemDate: any = new Date(Date.parse(date));
    // gets today's date
    let userDate: any = new Date();
    // splits date string at space into array with
    // each word
    let dateToSplit: any = new Date(date).toDateString();
    let splitDate: any = dateToSplit.split(' ');
    // gets difference between twitter date & user date
    // divide the value by 1000 to change milliseconds
    // into seconds
    let diff = Math.floor((userDate - systemDate) / 1000);

    // adds text depending on how many seconds the diff is
    // booleanValue is used to deterime to put text in
    // timeline section or direct messages section
    if (diff <= 1) { return 'just now'; }

    if (diff < 60) { return diff + ' seconds ago'; }

    if (diff <= 90) { return 'one minute ago'; }

    if (diff <= 3540) { return Math.round(diff / 60) + ' minutes ago'; }

    if (diff <= 5400) { return '1 hour ago'; }

    if (diff <= 86400) { return Math.round(diff / 3600) + ' hours ago'; }

    if (diff <= 129600) { return '1 day ago'; }

    if (diff < 604800) { return Math.round(diff / 86400) + ' days ago'; }

    if (diff <= 777600) { return '1 week ago'; }

    // if none of the above return true show actual date
    return splitDate[1] + ' ' + splitDate[2];
  }

}

import { Component } from '@angular/core';

import { ModalController, NavController, PopoverController, AlertController } from 'ionic-angular';

import { PopoverPage } from '../popovers/userInfo';
import { ModalContentPage } from '../modals/modalContent';
import { EditPage } from '../edit/edit';
import { UserService } from '../../services/user.service';
import { ModalAuthPage } from '../modals/modalAuth';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget';

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

  getAllBudgets() {
    // retrieves all budgets from budgetService
    this.budgetService.getAllBudgets()
      .subscribe(data => {
        console.log('data', data);
        if (data.length === 0) {
          this.visibleBudgets = false;
        } else {
          this.budgets = data;
          this.visibleBudgets = true;
          // loop through each budget entry
          for (let i = 0; i < this.budgets.length; i++) {
            // find the latest created budget entry in the array
            if (i === (this.budgets.length - 1)) {
              // make that one the selected budget on load
              this.selectedBudget = this.budgets[i];
            }
          }
        }
      }, err => {
        // this.handleError(err);
        console.log(err);
      });
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

  openModal() {
    let modal = this.modalCtrl.create(ModalContentPage);
    modal.present();
  }

  openAuthModal() {
    let modal = this.modalCtrl.create(ModalAuthPage);
    modal.onDidDismiss(data => {
      this.checkUserAuth();
      console.log(data);
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
      title: 'Use this lightsaber?',
      message: 'Do you agree to use this lightsaber to do good across the intergalactic galaxy?',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Agree',
          handler: () => {
            console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();
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

import { Component } from '@angular/core';

import { Platform, ViewController, NavParams, AlertController } from 'ionic-angular';

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
  reuseProjection: boolean = false;

  constructor(
    public platform: Platform,
    public viewCtrl: ViewController,
    params: NavParams,
    private budgetService: BudgetService,
    public alertCtrl: AlertController
  ) {
    this.editing = params.get('editing');
    this.selectedBudget = params.get('selectedBudget');
    this.budgets = params.get('budgets');
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
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
        // console.log('created budget', data);
        if (this.reuseProjection === false) {
        } else {
          // this.reuseProjections(budget);
        }

        this.reuseProjection = false;

        // this.hasValidationErrors = false;

        // this.toastr.success('Budget Created', 'Success!');
        //todo: add toaster here
        console.log('Budget created!');
        this.removeModal(data);
      }, err => {
        // this.handleError(err);
        console.error(err);
      });
  }

  // // reuse projections from last budget
  // reuseProjections(budget) {
  //   let prevProjection;
  //
  //   // get the budget items
  //   prevProjection = this.obtainPreviousBudget('post');
  //
  //   budget.budget_items = prevProjection.budget_items;
  //
  //   // update the new budget with last period's budget items
  //   this.budgetService.updateBudgetById(budget._id, budget)
  //     .subscribe(data => {
  //       // console.log(data);
  //       let budgetID = budget._id;
  //       this.editableBudget = this.budgets.filter(item => item._id === budgetID).pop();
  //     }, err => {
  //       // this.handleError(err);
  //       console.error(err);
  //     });
  // }
  //
  // // get the projection or budget items from last period
  // obtainPreviousBudget(string) {
  //   let budgetItems;
  //   let prevBudget;
  //
  //   // loop through each budget item
  //   for (let i = 0; i < this.budgets.length; i++) {
  //     // find the budget that was created last week
  //     if (string === 'post') {
  //       if (i === (this.budgets.length - 2)) {
  //         // assign the last budget to shownBudget variable
  //         budgetItems = this.budgets[i];
  //       }
  //     } else if (string === 'pre') {
  //       if (i === (this.budgets.length - 1)) {
  //         // assign the last budget to shownBudget variable
  //         budgetItems = this.budgets[i];
  //       }
  //     }
  //   }
  //
  //   // use a hack to make a deep copy of an array
  //   prevBudget = JSON.parse(JSON.stringify(budgetItems));
  //
  //   prevBudget.total_spent = this.getActualTotals(prevBudget.budget_items);
  //
  //   // loop through to remove all the actual values
  //   for (let i = 0; i < prevBudget.budget_items.length; i++) {
  //     prevBudget.budget_items[i].actual = [];
  //   }
  //
  //   // return the new budget_items array to use in the new budget
  //   return prevBudget;
  // }

  addUpdate(budget) {
    // update the new budget with last period's budget items
    this.budgetService.updateBudgetById(budget._id, budget)
      .subscribe(data => {
        this.dismiss(budget);
        // let budgetID = budget._id;
        // this.editableBudget = this.budgets.filter(item => item._id === budgetID).pop();
        // Object.assign(data, editableBudget);
        // was trying to assign chosenBudget to data...don't do that!
        // Needed to find correct budget in this.budgets and make that chosenBudget
        // this.updateBudget(this.editableBudget);
        // this.editingBudget = false;
        // this.hasValidationErrors = false;
        // this.toastr.success('Budget Updated', 'Success!');
        //todo: add toaster here
      }, err => {
        // this.handleError(err);
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
        }

        // this.hasValidationErrors = false;

        this.dismiss(this.selectedBudget);

        // this.toastr.success('Budget Deleted', 'Success!');
        //todo: add toaster here
      }, err => {
        // this.handleError(err);
        console.error(err);
      });
  }
}

// import statement
import { Component } from '@angular/core';
import {
  ModalController, NavController, PopoverController, AlertController, ToastController
} from 'ionic-angular';
import { PopoverPage } from '../popovers/userInfo';
import { ModalContentPage } from '../modals/modalContent';
import { EditPage } from '../edit/edit';
import {Budget, BudgetItems, ActualItems} from '../../models/budget';
import { NetworkService } from '../../services/network.service';
import 'chart.js';
import { AuthData } from '../../providers/auth-data';
import { WelcomePage } from '../welcome/welcome';
import { LoginPage } from '../login/login';
import * as moment from 'moment';


@Component({
  selector: 'page-home',
  templateUrl: './home.html'
})
export class HomePage {

  // declare variables
  budgets: Budget[];
  selectedBudget: Budget;
  currentUser: any;
  user: any;
  visibleBudgets: boolean = true;
  totalActual: number;
  totalSpent: number;
  mergeTotals: number;
  totalSaving: number;
  totals: any;
  percSaving: number;
  endingCash: number;
  projectionObject: any = {};
  actualObject: any = {};
  edited: boolean = false;
  hasValidationErrors: boolean = false;
  loading: boolean = false;
  projActual: string = 'actual';
  visibleTitle: boolean = true;
  saveAllData: any;
  errorMessage: any;
  upcomingItems: boolean = false;
  upcomingItemsArray: any = [];
  allBudgetsSubscription: any;
  // progress bar variables
  max: number = 100;
  radius: number = 95;
  semicircle: boolean = true;
  color: string = '#688dcc';
  colorAverage: string = '#826bbd';
  duration: number = 1000;
  animationDelay: number = 400;

  constructor(public navCtrl: NavController,
              public toastCtrl: ToastController,
              public popoverCtrl: PopoverController,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              private networkService: NetworkService,
              public authData: AuthData
  ) {
    // assign current user data
    this.currentUser = this.authData.getUserInfo();
  }

  ////////////////
  // LIFECYCLE FUNCTIONS
  ////////////////

  ngOnInit() {
    this.getAllBudgets();
  }

  ngOnDestroy() {
    this.allBudgetsSubscription.unsubscribe();
  }

  ////////////////
  // UTILITY FUNCTIONS
  ////////////////
  handleError(err) {
    // alert error message to user if there is one
    let errorMessage: string = err.message;
    let alert = this.alertCtrl.create({
      message: errorMessage,
      buttons: [{text: "Ok", role: 'cancel'}]
    });

    alert.present();
  }

  // creates toast to tell user of changes
  showToast(message:string, position: string, color: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: position,
      cssClass: color
    });

    toast.present(toast);
  }

  // parse date with moment.js
  parseMomentDate(date: any) {
    return moment().to(date);
  }

  // when changing budget...check for due dates
  onSelectChange(event) {
    this.checkForDueDates(this.selectedBudget);
  }

  // add user popover
  presentPopover(ev) {
    const popover = this.popoverCtrl.create(PopoverPage, {userInfo: this.currentUser});

    // if logout is clicked
    popover.onDidDismiss(data => {
      if (data === 'logout') {
        this.logoutUser();
        this.navCtrl.setRoot(LoginPage);
      }
    });

    popover.present({
      ev: ev
    });
  }

  goToEditPage(budget, budgetItems) {
    //push another page onto the history stack
    //causing the nav controller to animate the new page in
    this.navCtrl.push(EditPage, {
      budget: budget,
      budgetItem: budgetItems
    });
  }

  // confirm to delete specific BUDGET ITEM or ACTUAL ITEM
  showConfirmation(budgetItem, budget, actual) {
    const confirm = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'This will delete the item permanently.',
      buttons: [
        {
          text: 'Nope',
          handler: () => {

          }
        },
        {
          text: 'Yup',
          handler: () => {
            if (!budgetItem) {
              this.deleteActual(budget, actual);
            } else {
              this.deleteBudgetItem(budgetItem);
            }
          }
        }
      ]
    });
    confirm.present();
  }

  ////////////////
  // CORE FUNCTIONS
  ////////////////

  getAllBudgets() {
    // show alert if no internet connection
    if (this.networkService.isNoConnection()) {
      return this.networkService.showNetworkAlert();
    }

    // subscribe to get all budgets
    this.allBudgetsSubscription = this.authData.getBudgets().subscribe(data => {
      // if no budgets show user welcome page to create first budget
      if (data.length === 0) {
        console.log('no budget here!');
        this.budgets = null;
        this.visibleBudgets = false;
        this.selectedBudget = null;
        this.navCtrl.push(WelcomePage);

      } else {
        // else assign data to budgets variable
        this.budgets = data;
        this.visibleBudgets = true;

        // if specific budget assigned to selectedBudget variable then...assign that budget to selectedBudget
        if (this.selectedBudget) {
          // loop through each budget entry
          for (let i = 0; i < this.budgets.length; i++) {
            // find the latest created budget entry in the array
            if (this.budgets[i].start_period === this.selectedBudget.start_period) {
              // make that one the selected budget on load
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

        // lastly, check for any due dates
        this.checkForDueDates(this.selectedBudget);
      }

    }, this.handleError);
  }

  // check for due dates for current budget to display on the page
  checkForDueDates(selectedBudget) {
    this.upcomingItemsArray = [];

    // loop through to get all the due dates
    for (let i = 0; i < selectedBudget.budget_items.length; i++) {
      if (selectedBudget.budget_items[i].due === true) {
        this.upcomingItemsArray.push({name: selectedBudget.budget_items[i].item, dueDate: selectedBudget.budget_items[i].due_date});
      }
    }

    // if there are not due dates set upcomingItems to false
    if (this.upcomingItemsArray.length === 0) {
      this.upcomingItems = false;

      // else if there are due dates
    } else {
      this.upcomingItems = true;

      // sort due dates by dueDate
      this.upcomingItemsArray.sort((a, b) => {
        const firstDate: any = new Date(a.dueDate);
        const secondDate: any = new Date(b.dueDate);
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return firstDate - secondDate;
      });
    }
  }

  // calculate average saving amount for all budgets
  getAverageSaving(budgets) {
    // add up all period savings and divide by number of them
    let totalNumber = 0;
    let savings = 0;
    let average;

    for (let i = 0; i < budgets.length; i++) {
      totalNumber++;
      savings += +this.getTotalSpent(budgets[i], 'actual').percSaving;
    }

    average = savings / totalNumber;

    return average;
  }

  // creates empty budget
  createEmptyBudget() {
    let newBudget = new Budget();
    let previousBudget = this.obtainPreviousBudget('pre');

    newBudget.existing_cash = (previousBudget.existing_cash + previousBudget.current_income) - this.actualObject.totalSpent;
    newBudget.current_income = previousBudget.current_income;
    // make this new budget the shown one in the modal for editing
    // this.selectedBudget = newBudget;
    // this.budgets.push(this.selectedBudget);


    let modal = this.modalCtrl.create(ModalContentPage, {
      editing: false,
      selectedBudget: newBudget,
      budgets: this.budgets
    });

    modal.onDidDismiss(() => {
      // loop through each budget entry
      for (let i = 0; i < this.budgets.length; i++) {
        // find the latest created budget entry in the array
        if (i === (this.budgets.length - 1)) {
          // make that one the selected budget on load
          this.selectedBudget = this.budgets[i];
        }
      }

      this.checkForDueDates(this.selectedBudget);

    });

    modal.present();
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

    // loop through to remove all the actual values
    for (let i = 0; i < prevBudget.budget_items.length; i++) {
      prevBudget.budget_items[i].actual = [];
    }

    // return the new budget_items array to use in the new budget
    return prevBudget;
  }

  logoutUser() {
    this.authData.logoutUser();
  }

  openModalEdit() {
    const modal = this.modalCtrl.create(ModalContentPage, {
      editing: true,
      selectedBudget: this.selectedBudget,
      budgets: this.budgets
    });
    modal.onDidDismiss(data => {
      if (this.budgets && this.budgets.length > 0) {
        if (data) {
          // loop through each budget entry
          for (let i = 0; i < this.budgets.length; i++) {
            // find the latest created budget entry in the array
            if (data === this.budgets[i]) {
              // make that one the selected budget on load
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

        this.checkForDueDates(this.selectedBudget);
      }

    });
    modal.present();
  }

  // delete specific budget item
  deleteBudgetItem(budgetItem) {
    const budget = this.selectedBudget.budget_items;
    // loop through budget_items
    for (let i = 0; i < budget.length; i++) {
      // if a match to the budget passed in
      if (budget[i] === budgetItem) {
        // remove it
        budget.splice(i, 1);

        if (budget.length === 0) {
          budget.push(new BudgetItems());
        }

        this.saveAll();
      }
    }
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

        if (budget.actual.length === 0) {
          budget.actual.push(new ActualItems());
        }

        this.saveAll();
      }
    }
  }

  // save all edits
  saveAll(string?) {
    const chosenBudgetKey = this.selectedBudget.$key;

    // adds updatedAt value
    this.selectedBudget.updatedAt = (new Date).toISOString();

    // update specific budget
    this.authData.getBudgets().update(chosenBudgetKey, this.selectedBudget).then(() => {
      // checks for 'toggle' string so toast is not showed every time user toggles between positive & negative
      if (string !== 'toggle') {
        this.showToast('Everything saved!', 'bottom', 'toaster-green');
      }
    }, this.handleError);
  }

  // add new budget item to budget_items array in specific budget
  addBudgetItem() {
    // create a new budget item using defined types
    let newBudgetItem = new BudgetItems();
    let item;

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

    this.goToEditPage(this.selectedBudget, item);
  }

  // calculates total spent for entire budget
  getTotalSpent(budget, type) {
    // initialize totalSpent to 0
    this.totalSpent = 0;

    if (type === 'actual') {
      // loop through each item in budget_items
      for (let i = 0; i < budget.budget_items.length; i++) {
        let item = budget.budget_items[i];
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

      // total saving
      this.totalSaving = budget.current_income - this.totalSpent;

      // percentage saving
      this.percSaving = this.totalSaving / budget.current_income;

      // ending cash amount
      this.endingCash = budget.existing_cash + budget.current_income - this.totalSpent;

      this.actualObject = Object.assign({}, {
        totalSpent: this.totalSpent,
        totalSaving: this.totalSaving,
        percSaving: this.percSaving,
        endingCash: this.endingCash
      });

      // return the total spent number for the entire budget
      return this.actualObject;

    } else if (type === 'projection') {
      // loop through each item in budget_items
      for (let i = 0; i < budget.budget_items.length; i++) {
        this.totalSpent += +budget.budget_items[i].projection;
      }

      // total saving
      this.totalSaving = budget.current_income - this.totalSpent;

      // percentage saving
      this.percSaving = this.totalSaving / budget.current_income;

      // ending cash amount
      this.endingCash = budget.existing_cash + budget.current_income - this.totalSpent;

      this.projectionObject = Object.assign({}, {
        totalSpent: this.totalSpent,
        totalSaving: this.totalSaving,
        percSaving: this.percSaving,
        endingCash: this.endingCash
      });

      return this.projectionObject;
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

  // used for saving percentage semi circle bar charts
  getOverlayStyle() {
    let isSemi = this.semicircle;
    let transform = (isSemi ? '' : 'translateY(-50%) ') + 'translateX(-50%)';

    return {
      'top': isSemi ? 'auto' : '50%',
      'bottom': isSemi ? '5%' : 'auto',
      'left': '50%',
      'transform': transform,
      '-moz-transform': transform,
      '-webkit-transform': transform,
      'font-size': this.radius / 3.5 + 'px'
    };
  }
}

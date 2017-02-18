import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';

import {
  ModalController, NavController, PopoverController, AlertController, ToastController, Content, App
} from 'ionic-angular';

import { PopoverPage } from '../popovers/userInfo';
import { ModalContentPage } from '../modals/modalContent';
import { EditPage } from '../edit/edit';
import {Budget, BudgetItems, ActualItems} from '../../models/budget';
import { NetworkService } from '../../services/network.service';
import 'chart.js';
import { AuthData } from '../../providers/auth-data';

import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { WelcomePage } from '../welcome/welcome';
import { LoginPage } from '../login/login';

import * as moment from 'moment';


@Component({
  selector: 'page-home',
  templateUrl: './home.html'
})
export class HomePage {

  @ViewChild(Content) content: Content;

  allBudgets: FirebaseListObservable<any>;
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

  subscription: any;

  checkingScroll: any;


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
              public app: App,
              private networkService: NetworkService,
              private ref: ChangeDetectorRef,
              public authData: AuthData,
              af: AngularFire
  ) {
    // assign data to variables
    this.currentUser = this.authData.getUserInfo();
    this.allBudgets = af.database.list('/users/' + this.currentUser.uid + '/budgets', {
      query: {
        orderByChild: 'start_period',
      }
    });
  }

  ngOnInit() {
    this.checkScroll();
    this.getAllBudgets();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    if (this.checkingScroll) {
      this.checkingScroll.unsubscribe();
    }
  }

  // check scroll to switch between logo image and ending cash amount
  checkScroll() {
    this.checkingScroll = this.content.ionScroll.subscribe(() => {
      if (this.content.scrollTop <= 50) {
        this.visibleTitle = true;
        this.ref.detectChanges();
      } else {
        this.visibleTitle = false;
        this.ref.detectChanges();
      }
    });
  }

  // refresh the data on pull down
  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    this.ngOnDestroy();

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
      this.getAllBudgets();
    }, 2000);
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
        let firstDate: any = new Date(a.dueDate);
        let secondDate: any = new Date(b.dueDate);
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return firstDate - secondDate;
      });
    }
  }

  // parse date with moment.js
  parseMomentDate(date: any) {
    return moment().to(date);
  }

  // when changing budget...check for due dates
  onSelectChange(event) {
    this.checkForDueDates(this.selectedBudget);
  }

  getAllBudgets() {
    // show alert if no internet connection
    if (this.networkService.isNoConnection()) {
      return this.networkService.showNetworkAlert();
    }

    // subscribe to get all budgets
    this.subscription = this.authData.getBudgets().subscribe(data => {
      // if no budgets show user welcome page to create first budget
      if (data.length === 0) {
        console.log('no budgets!');
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

    }, (err) => {
      console.log(err);
      // alert error message to user if there is one
      let errorMessage: string = err.message;
      let alert = this.alertCtrl.create({
        message: errorMessage,
        buttons: [{text: "Ok", role: 'cancel'}]
      });

      alert.present();
    });
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
    this.selectedBudget = newBudget;
    this.budgets.push(this.selectedBudget);


    let modal = this.modalCtrl.create(ModalContentPage, {
      editing: false,
      selectedBudget: this.selectedBudget,
      budgets: this.budgets
    });

    modal.onDidDismiss(data => {
      if (data) {
        if (data.remove && data.remove === true) {
          let newIndex = 0;

          this.budgets.filter((item, i) => {
            if (item.start_period === this.selectedBudget.start_period) {
              this.budgets.splice(i, 1);
              newIndex = i - 1;
            }
          });

          // loop through each budget entry
          for (let i = 0; i < this.budgets.length; i++) {
            // find the latest created budget entry in the array
            if (i === (this.budgets.length - 1)) {
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

  // add user popover
  presentPopover(ev) {
    let popover = this.popoverCtrl.create(PopoverPage, {userInfo: this.currentUser});

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

  openModalEdit() {
    let modal = this.modalCtrl.create(ModalContentPage, {
      editing: true,
      selectedBudget: this.selectedBudget,
      budgets: this.budgets
    });
    modal.onDidDismiss(data => {
      if (data) {
        if (data === 'no budgets') {
          // don't really need this part of the if statement since it's handled in the getAllBudgets function above
          this.visibleBudgets = false;

        } else {
          // loop through each budget entry
          for (let i = 0; i < this.budgets.length; i++) {
            // find the latest created budget entry in the array
            if (this.budgets[i].start_period === data.start_period) {
              // make that one the selected budget on load
              this.selectedBudget = this.budgets[i];
            }
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

    });
    modal.present();
  }

  openModalNew() {
    this.createEmptyBudget();
  }

  goToEditPage(budget, budgetItems) {
    //push another page onto the history stack
    //causing the nav controller to animate the new page in
    this.navCtrl.push(EditPage, {
      budget: budget,
      budgetItem: budgetItems
    });
  }

  // confirm to delete specific budget item
  showConfirm(budgetItem) {
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
            this.deleteBudgetItem(budgetItem);
          }
        }
      ]
    });
    confirm.present();
  }

  // delete specific budget item
  deleteBudgetItem(budgetItem) {
    let budget = this.selectedBudget.budget_items;
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

  // confirm to delete specific actual item
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

        if (budget.actual.length === 0) {
          budget.actual.push(new ActualItems());
        }

        this.saveAll();
      }
    }
    console.log(budget);
  }

  // save all edits
  saveAll(string?) {
    let chosenBudgetKey;

    chosenBudgetKey = this.selectedBudget.$key;

    // delete key/value that causes firebase to error out
    delete this.selectedBudget.$exists;
    delete this.selectedBudget.$key;

    // adds updatedAt value
    this.selectedBudget.updatedAt = (new Date).toISOString();

    // update specific budget
    this.allBudgets.update(chosenBudgetKey, this.selectedBudget).then(() => {
      // checks for 'toggle' string so toast is not showed every time user toggles between positive & negative
      if (string !== 'toggle') {
        this.showToast('Everything saved!', 'bottom', 'toaster-green');
      }
    }, (err) => {
      console.log(err);
      // alert message to user
      let errorMessage: string = err.message;
      let alert = this.alertCtrl.create({
        message: errorMessage,
        buttons: [{ text: "Ok", role: 'cancel' } ]
      });

      alert.present();
    });
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

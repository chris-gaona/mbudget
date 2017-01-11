import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';

import {
  ModalController, NavController, PopoverController, AlertController, ToastController, Content, App
} from 'ionic-angular';

import { PopoverPage } from '../popovers/userInfo';
import { ModalContentPage } from '../modals/modalContent';
import { EditPage } from '../edit/edit';
import { Budget, BudgetItems } from '../../models/budget';
import { NetworkService } from '../../services/network.service';
import 'chart.js';
import { AuthData } from '../../providers/auth-data';

import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { WelcomePage } from '../welcome/welcome';
import { LoginPage } from '../login/login';

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
  validationErrors: any;
  hasValidationErrors: boolean = false;
  loading: boolean = false;
  projActual: string = 'actual';
  visibleTitle: boolean = true;
  saveAllData: any;
  errorMessage: any;

  private subscription: any;


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
    this.currentUser = this.authData.getUserInfo();
    this.user = af.database.list('/users/' + this.currentUser.uid + '/user-info');
    this.allBudgets = af.database.list('/users/' + this.currentUser.uid + '/budgets');
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.checkScroll();
    this.getAllBudgets();
  }

  checkScroll() {
    this.content.ionScroll.subscribe(() => {
      if (this.content.scrollTop <= 50) {
        this.visibleTitle = true;
        this.ref.detectChanges();
      } else {
        this.visibleTitle = false;
        this.ref.detectChanges();
      }
    });
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    // this.getAllBudgets();

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getAllBudgets(editedBudget?) {
    this.subscription = this.authData.getBudgets().subscribe(data => {
      if (data.length === 0) {
        this.budgets = null;
        console.log('no budgets!');
        this.visibleBudgets = false;
        this.navCtrl.push(WelcomePage);
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
              // this.averageSaving = this.getAverageSaving(this.budgets);
            }
          }
        }
      }
      console.log('budgets', this.budgets);
    });
  }

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
    this.convertDate(newBudget, newBudget.start_period);
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
      let updatedBudget;

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
              // this.averageSaving = this.getAverageSaving(this.budgets);
            }
          }
        } else {
          // loop through each budget entry
          for (let i = 0; i < this.budgets.length; i++) {
            // find the latest created budget entry in the array
            if (i === (this.budgets.length - 1)) {
              // make that one the selected budget on load
              this.selectedBudget = this.budgets[i];
              // this.averageSaving = this.getAverageSaving(this.budgets);
            }
          }
        }
        // this.getAllBudgets(updatedBudget);
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

  presentPopover(ev) {
    let popover = this.popoverCtrl.create(PopoverPage, {userInfo: this.currentUser});

    popover.onDidDismiss(data => {
      if (data === 'logout') {
        this.ngOnDestroy();
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
          this.visibleBudgets = false;
          // this.getAllBudgets();
        } else {
          this.edited = true;
          // this.getAllBudgets(data);
        }
      }
    });
    modal.present();
  }

  openModalNew() {
    this.createEmptyBudget();
  }

  // openAuthModal() {
  //   let modal = this.modalCtrl.create(ModalAuthPage);
  //   modal.onDidDismiss(data => {
  //     // this.checkUserAuth();
  //   });
  //   modal.present();
  // }

  goToEditPage(budget, budgetItems) {
    //push another page onto the history stack
    //causing the nav controller to animate the new page in
    this.navCtrl.push(EditPage, {
      budget: budget,
      budgetItem: budgetItems
    });
  }

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
        this.saveAll();
      } else {
        this.showToast('Sorry. That item does not exist.', 'bottom', 'toaster-red');
        return;
      }
    }
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
  saveAll(string?) {
    let chosenBudgetKey;

    chosenBudgetKey = this.selectedBudget.$key;

    delete this.selectedBudget.$exists;
    delete this.selectedBudget.$key;
    this.selectedBudget.updatedAt = (new Date).toISOString();

    this.allBudgets.update(chosenBudgetKey, this.selectedBudget).then(() => {
      if (string !== 'toggle') {
        this.showToast('Everything saved!', 'bottom', 'toaster-green');
      }
    }).catch((err) => {
      this.handleError(err);
      console.log(err);
    });

    // // passes budget_items array to saveAll function on budgetService
    // this.budgetService.updateBudgetById(this.selectedBudget._id, this.selectedBudget)
    //   .subscribe(data => {
    //     console.log('Everything saved!');
    //     this.saveAllData = data;
    //     if (string !== 'toggle') {
    //       this.showToast('Everything saved!', 'bottom', 'toaster-green');
    //     }
    //   }, err => {
    //     this.handleError(err);
    //     console.log(err);
    //   });
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

  // toggleAddSubtract() {
  //   this.saveAll('toggle');
  // }

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

import { Component } from '@angular/core';
import { NavController, ToastController, PopoverController } from 'ionic-angular';
import { Budget } from '../../models/budget';
import {AuthData} from "../../providers/auth-data";
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { PopoverPage } from '../popovers/userInfo';
import { LoginPage } from '../login/login';


@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {

  loading: boolean = false;
  budgets: FirebaseListObservable<any>;
  currentUser: any;

  constructor(public navCtrl: NavController,
              public toastCtrl: ToastController,
              public popoverCtrl: PopoverController,
              public authData: AuthData,
              af: AngularFire) {
    this.budgets = af.database.list('/users/' + this.authData.getUserInfo().uid + '/budgets');
    this.currentUser = this.authData.getUserInfo();
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

  // creates empty budget
  createFirstBudget() {
    let newBudget = new Budget();
    console.log('new budget', newBudget);
    this.convertDate(newBudget, newBudget.start_period);
    // converts the date string from 2016-10-30 to 10/30/2016
    let startDate = newBudget.start_period.split('-');
    let newDateString = startDate[1] + '/' + startDate[2] + '/' + startDate[0];
    let newDate = new Date(newDateString).toISOString();
    newBudget.start_period = newDate;
    newBudget.existing_cash = 1;
    newBudget.current_income = 1;

    this.budgets.push(newBudget);
    this.loading = false;

    console.log('First budget created!');
    this.showToast('First budget created!', 'bottom', 'toaster-green');

    this.goBack();
  }

  presentPopover(ev) {
    let popover = this.popoverCtrl.create(PopoverPage, {userInfo: this.currentUser});

    popover.onDidDismiss(data => {
      if (data === 'logout') {
        this.navCtrl.setRoot(LoginPage);
      }
    });

    popover.present({
      ev: ev
    });
  }

  goBack() {
    this.navCtrl.pop();
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
}

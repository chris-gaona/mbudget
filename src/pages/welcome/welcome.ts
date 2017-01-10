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
    newBudget.start_period = (new Date).toISOString();
    newBudget.existing_cash = 1;
    newBudget.current_income = 1;

    this.budgets.push(newBudget);
    this.loading = false;

    console.log('First budget created!');
    this.showToast('First budget created!', 'bottom', 'toaster-green');

    this.goBack();

    // this.budgetService.addBudget(newBudget)
    //   .subscribe(data => {
    //     this.getAllBudgets();
    //     this.selectedBudget = data;
    //     this.visibleBudgets = true;
    //     this.loading = false;
    //
    //     this.openModalEdit();
    //
    //     console.log('First Budget', this.budgets);
    //
    //     this.showToast('First budget created!', 'bottom', 'toaster-green');
    //   }, err => {
    //     this.handleError(err);
    //     console.log(err);
    //   });
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
}
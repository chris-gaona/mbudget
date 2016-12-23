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

  projActual = 'actual';
  period = 'Nov21';

  projections = [
    {
      item: 'Gas',
      projection: 0
    },
    {
      item: 'Verizon',
      projection: 25
    },
    {
      item: 'Food',
      projection: 115.86
    },
    {
      item: 'Credit Card',
      projection: 50
    },
    {
      item: 'Miscellaneous',
      projection: 125.65
    },
    {
      item: 'Cash Withdrawal',
      projection: 20
    }
  ];

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
        console.log(data);
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

  goToContactPage() {
    //push another page onto the history stack
    //causing the nav controller to animate the new page in
    this.navCtrl.push(EditPage);
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

}

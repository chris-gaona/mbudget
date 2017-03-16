import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { BudgetItems } from '../../models/budget';
import * as moment from 'moment';

@Component({
  template: `
    <ion-list no-lines no-margin class="popover-item" id="greeting">
      <ion-list-header>
        What is the due date?
      </ion-list-header>
      <ion-item>
        <ion-label>Due Date</ion-label>
        <ion-datetime displayFormat="MMM DD, YYYY hh:mm a" [min]="minDate()" [max]="maxDate()" [(ngModel)]="myDate"></ion-datetime>
      </ion-item>
    </ion-list>
  `,
  styles: [`
    
  `]
})
export class PopoverDueDatePage {

  myDate: any = moment().format();
  budgetItem: BudgetItems;

  constructor(params: NavParams,
              public viewCtrl: ViewController) {
    this.budgetItem = params.get('budgetItem');
  }

  ionViewWillLeave() {
    this.budgetItem.due_date = this.myDate;
  }

  // used to close the popover on command
  closePopover() {
    this.viewCtrl.dismiss(this.myDate);
  }

  todayDate() {
    return new Date();
  }

  minDate() {
    return moment().format();
  }

  maxDate() {
    return moment().add(30, 'days').format();
  }
}

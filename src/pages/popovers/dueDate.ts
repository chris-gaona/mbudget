import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { BudgetItems } from '../../models/budget';

@Component({
  template: `
    <ion-list no-lines no-margin class="popover-item" id="greeting">
      <ion-list-header>
        What is the due date?
      </ion-list-header>
      <ion-item>
        <ion-label>Due Date</ion-label>
        <ion-datetime displayFormat="MMM DD YYYY" [min]="convertDate(0)" [max]="convertDate(30)" [(ngModel)]="myDate"></ion-datetime>
      </ion-item>
    </ion-list>
  `,
  styles: [`
    
  `]
})
export class PopoverDueDatePage {

  myDate: any = this.convertDate(0);
  budgetItem: BudgetItems;

  constructor(params: NavParams,
              public viewCtrl: ViewController) {
    this.budgetItem = params.get('budgetItem');
  }

  ionViewWillLeave() {
    this.budgetItem.due_date = new Date(this.myDate).toISOString();
  }

  // used to close the popover on command
  closePopover() {
    this.viewCtrl.dismiss(this.myDate);
  }

  todayDate() {
    return new Date();
  }

  // converts date string to 2016-10-29
  convertDate(days) {
    let date = new Date();

    date.setTime( date.getTime() + days * 86400000 );


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
    return dateString;
  }
}

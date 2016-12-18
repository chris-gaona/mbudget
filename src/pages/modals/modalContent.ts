import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

@Component({
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>
      I love change!
    </ion-title>
    <ion-buttons start>
      <button ion-button (click)="dismiss()">
        <span ion-text color="primary" showWhen="ios">Cancel</span>
        <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
      </button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
<ion-content>
  <p ion-text padding no-margin class="sub-text">Please be careful while editing...I take no responsibility for your mistakes.</p>
  <ion-list>

    <ion-item>
      <ion-label><ion-icon name="calendar"></ion-icon> Current period start?</ion-label>
      <ion-datetime displayFormat="MMM DD YYYY" [(ngModel)]="event.month"></ion-datetime>
    </ion-item>
  
    <ion-item>
      <ion-label floating><ion-icon name="logo-usd"></ion-icon> What's your current total cash?</ion-label>
      <ion-input type="number"></ion-input>
    </ion-item>
  
    <ion-item>
      <ion-label floating><ion-icon name="logo-usd"></ion-icon> What's your current income?</ion-label>
      <ion-input type="number"></ion-input>
    </ion-item>
  </ion-list>
  <ion-fab left bottom>
    <button ion-button round color="royal">
      Update
    </button>
  </ion-fab>
  <ion-fab right bottom>
    <button ion-button round color="danger" icon-only>
      <ion-icon name="trash"></ion-icon>
    </button>
  </ion-fab>
</ion-content>
`
})
export class ModalContentPage {
  character;

  public event = {
    month: '1990-02-19',
    timeStarts: '07:43',
    timeEnds: '1990-02-20'
  };

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {
    var characters = [
      {
        name: 'Gollum',
        quote: 'Sneaky little hobbitses!',
        image: 'assets/img/avatar-gollum.jpg',
        items: [
          { title: 'Race', note: 'Hobbit' },
          { title: 'Culture', note: 'River Folk' },
          { title: 'Alter Ego', note: 'Smeagol' }
        ]
      },
      {
        name: 'Frodo',
        quote: 'Go back, Sam! I\'m going to Mordor alone!',
        image: 'assets/img/avatar-frodo.jpg',
        items: [
          { title: 'Race', note: 'Hobbit' },
          { title: 'Culture', note: 'Shire Folk' },
          { title: 'Weapon', note: 'Sting' }
        ]
      },
      {
        name: 'Samwise Gamgee',
        quote: 'What we need is a few good taters.',
        image: 'assets/img/avatar-samwise.jpg',
        items: [
          { title: 'Race', note: 'Hobbit' },
          { title: 'Culture', note: 'Shire Folk' },
          { title: 'Nickname', note: 'Sam' }
        ]
      }
    ];
    this.character = characters[this.params.get('charNum')];
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}

import { Component } from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

@Component({
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>
      {{editing ? "Making some changes!" : "Let's track your pay!"}}
    </ion-title>
    <ion-buttons end>
      <button ion-button (click)="dismiss()">
        <span ion-text color="primary" showWhen="ios">Cancel</span>
        <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
      </button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
<ion-content id="modal-container">
  <p ion-text padding no-margin class="sub-text">Please be careful while editing. I take no responsibility for your mistakes.</p>
  <ion-list>
  
    <ion-item>
      <ion-label stacked>When does the current period start?</ion-label>
      <ion-datetime displayFormat="MMM DD YYYY" [(ngModel)]="event.month"></ion-datetime>
    </ion-item>

    <ion-item>
      <ion-label stacked>What's your current total cash?</ion-label>
      <ion-input type="number"></ion-input>
    </ion-item>
  
    <ion-item>
      <ion-label stacked>What's your current income?</ion-label>
      <ion-input type="number"></ion-input>
    </ion-item>
    
    <ion-item>
      <ion-buttons left>
        <button ion-button color="royal" margin-left>
          Update
        </button>
        <button ion-button color="danger" icon-only margin-left>
          <ion-icon name="trash"></ion-icon>
        </button>
      </ion-buttons>
    </ion-item>
  
  </ion-list>
  
  <div class="dog-container">
    <div class="dog">
      <div class="ears"></div>
  
      <div class="dog-body">
        <div class="eyes"></div>
        <div class="beard">
          <div class="mouth">
            <div class="tongue"></div>
          </div>
        </div>
        <div class="belt">
          <div class="locket"></div>
          <div class="dot dot1"></div>
          <div class="dot dot2"></div>
          <div class="dot dot3"></div>
          <div class="dot dot4"></div>
          <div class="tag"></div>
        </div>
        <div class="stomach">
        </div>
        <div class="legs">
          <div class="left"></div>
          <div class="right"></div>
        </div>
      </div>
      <div class="tail">
      </div>
    </div>
  </div>
  
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

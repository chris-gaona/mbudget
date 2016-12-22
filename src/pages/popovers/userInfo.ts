import { Component } from '@angular/core';

@Component({
  template: `
    <ion-list no-lines no-margin class="popover-item">
      <ion-list-header>
        User Info
      </ion-list-header>
      <ion-item>
        <ion-avatar item-left>
          <img src="https://placeimg.com/100/100/people">
        </ion-avatar>
        <h2>Hello, Chris</h2>
        <p>Enjoy today!</p>
      </ion-item>
      <ion-item>
        <button ion-button block padding-vertical>Logout</button>
      </ion-item>
    </ion-list>
  `
})
export class PopoverPage {

  constructor() {

  }

  ngOnInit() {

  }
}

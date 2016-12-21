import { TestBed, async, ComponentFixture } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';

import {
  IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform, Keyboard,
  Form, PopoverController, ModalController, AlertController
} from 'ionic-angular';

import { ConfigMock } from '../../mocks';
import { HomePage } from './home';

describe('Component: ModalContentPage', () => {
  let fixture;
  let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule
      ],
      declarations: [
        HomePage
      ],
      providers: [
        App, Platform, Form, Keyboard, MenuController, NavController, GestureController, DomController,
        PopoverController, ModalController, AlertController,
        {provide: Config, useClass: ConfigMock}
      ]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(HomePage);
    // get test component from the fixture
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });
});

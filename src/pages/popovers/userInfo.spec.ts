import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PopoverPage } from './userInfo';
import { IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform, Keyboard, Form } from 'ionic-angular';

import { ConfigMock } from '../../mocks';

describe('Component: Jumbotron', () => {
  let fixture;
  let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule
      ],
      declarations: [
        PopoverPage
      ],
      providers: [
        App, Platform, Form, Keyboard, MenuController, NavController, GestureController, DomController,
        {provide: Config, useClass: ConfigMock}
      ]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(PopoverPage);
    // get test component from the fixture
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });
});

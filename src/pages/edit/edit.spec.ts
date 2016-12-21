import { TestBed, async, ComponentFixture } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';

import {
  IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform, Keyboard,
  Form
} from 'ionic-angular';

import { ConfigMock } from '../../mocks';
import { EditPage } from './edit';

describe('Component: ModalContentPage', () => {
  let fixture;
  let component;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        IonicModule
      ],
      declarations: [
        EditPage
      ],
      providers: [
        App, Platform, Form, Keyboard, MenuController, NavController, GestureController, DomController,
        {provide: Config, useClass: ConfigMock}
      ]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(EditPage);
    // get test component from the fixture
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });
});

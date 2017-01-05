import {TestBed, async} from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';

import {
  IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform,
  Keyboard, Form, ViewController, NavParams
} from 'ionic-angular';

import { ConfigMock, ViewControllerMock, MockNavParams } from '../../mocks';
import { PopoverPage } from './userInfo';
import { UserService } from '../../services/user.service';
import { AbstractMockObservableService } from '../../services/mock.service';

class MockService extends AbstractMockObservableService {
  isLoggedIn() {
    return this;
  };
}

describe('Component: PopoverPage ', () => {
  let fixture;
  let component;
  let userService;

  beforeEach(() => {
    userService = new MockService();

    TestBed.configureTestingModule({
      imports: [
        IonicModule
      ],
      declarations: [
        PopoverPage
      ],
      providers: [
        App,
        Platform,
        Form,
        Keyboard,
        MenuController,
        NavController,
        GestureController,
        DomController,
        {provide: NavParams, useClass: MockNavParams},
        {provide: ViewController, useClass: ViewControllerMock},
        {provide: Config, useClass: ConfigMock}
      ]
    }).overrideComponent(PopoverPage, {
      set: {
        providers: [
          { provide: UserService, useValue: userService }
        ]
      }
    });

    // create component and test fixture
    fixture = TestBed.createComponent(PopoverPage);
    // get test component from the fixture
    component = fixture.componentInstance;
  });

  it('should create an instance', async(() => {
    expect(component).toBeTruthy();
  }));
});

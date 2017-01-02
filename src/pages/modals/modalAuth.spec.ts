import {TestBed, async} from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';

import {
  IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform,
  Keyboard, Form, ModalController, ViewController, ToastController
} from 'ionic-angular';

import { ConfigMock, ViewControllerMock } from '../../mocks';
import { ModalAuthPage } from './modalAuth';
import { UserService } from '../../services/user.service';
import { AbstractMockObservableService } from '../../services/mock.service';

class MockService extends AbstractMockObservableService {
  getAllBudgets() {
    return this;
  }

  getUser() {
    return this;
  }

  updateBudgetById() {
    return this;
  }

  login() {
    return this;
  }

  isLoggedIn() {
    return this;
  }
}

describe('Component: ModalAuthPage ', () => {
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
        ModalAuthPage
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
        ModalController,
        ToastController,
        {provide: ViewController, useClass: ViewControllerMock},
        {provide: Config, useClass: ConfigMock}
      ]
    }).overrideComponent(ModalAuthPage, {
      set: {
        providers: [
          { provide: UserService, useValue: userService }
        ]
      }
    });

    // create component and test fixture
    fixture = TestBed.createComponent(ModalAuthPage);
    // get test component from the fixture
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
    expect(component.loginButtonMain).toBe(true);
    expect(component.hasValidationErrors).toBe(false);
    expect(component.loading).toBe(false);
  });

  describe('#loggedInUser()', () => {
    it('should get the currently logged in user', async(() => {
      let user = {username: 'jake123', firstName: 'Jake'};
      userService.content = user;
      component.loggedInUser();
      expect(component.currentUser).toBe(user);
      expect(component.loading).toBe(false);
    }));
  });

  //todo: add unit test for login, signUp, and handlError functions

  // describe('#login(username, password)', () => {
  //   it('should login an existing user', () => {
  //     let user = {username: 'jake123', password: 'password'};
  //     userService.content = user;
  //     component.login(user.username, user.password);
  //     expect(component.currentUser).toBe(user);
  //   });
  // });

  // describe('#handleError(error)', () => {
  //   it('should handle errors properly', () => {
  //     component.loading = true;
  //     expect(component.hasValidationErrors).toBe(false);
  //     component.handleError(JSON.stringify({ "_body": { "message": "message", "statusText": "error" }}));
  //     expect(component.loading).toBe(false);
  //   });
  // })
});

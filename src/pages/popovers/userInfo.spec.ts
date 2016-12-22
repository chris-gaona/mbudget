import { TestBed } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';

import { IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform,
  Keyboard, Form } from 'ionic-angular';

import { ConfigMock } from '../../mocks';
import { PopoverPage } from './userInfo';
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
        App, Platform, Form, Keyboard, MenuController, NavController, GestureController, DomController,
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

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });
});

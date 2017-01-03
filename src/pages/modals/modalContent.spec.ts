import { TestBed, async, ComponentFixture } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';

import {
  IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform, Keyboard,
  Form, ViewController, NavParams, ToastController, AlertController
} from 'ionic-angular';

import { ConfigMock, ViewControllerMock, MockNavParams, ToastControllerMock } from '../../mocks';
import { ModalContentPage } from './modalContent';
import { TextMaskModule } from 'angular2-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask.js'
import { AbstractMockObservableService } from '../../services/mock.service';
import { BudgetService } from '../../services/budget.service';

class MockService extends AbstractMockObservableService {
  addBudget() {
    return this;
  }

  updateBudgetById() {
    return this;
  }

  deleteBudgetById() {
    return this;
  }
}

describe('Component: ModalContentPage', () => {
  let fixture;
  let component;
  let budgetService;

  beforeEach(() => {
    budgetService = new MockService();

    TestBed.configureTestingModule({
      imports: [
        IonicModule,
        TextMaskModule
      ],
      declarations: [
        ModalContentPage
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
        createNumberMask,
        AlertController,
        {provide: ToastController, useClass: ToastControllerMock},
        {provide: NavParams, useClass: MockNavParams},
        {provide: ViewController, useClass: ViewControllerMock},
        {provide: Config, useClass: ConfigMock}
      ]
    }).overrideComponent(ModalContentPage, {
      set: {
        providers: [
          { provide: BudgetService, useValue: budgetService }
        ]
      }
    });

    // create component and test fixture
    fixture = TestBed.createComponent(ModalContentPage);
    // get test component from the fixture
    component = fixture.componentInstance;
  });

  it('should create an instance', async(() => {
    expect(component).toBeTruthy();
    expect(component.reuseProjection).toBe(true);
    expect(component.hasValidationErrors).toBe(false);
  }));

  describe('#convertNumberToString()', () => {
    it('should convert a number to a currency formatted string', async(() => {
      component.selectedBudget = {
        existing_cash: 25000,
        current_income: 1900
      };

      component.convertNumberToString();

      expect(component.existingCashString).toEqual('$25,000.00');
      expect(component.currentIncomeString).toEqual('$1,900.00');
    }));
  });

  describe('#convertStringToNumber()', () => {
    it('should convert a currency formatted string to number', async(() => {
      component.selectedBudget = {
        existing_cash: 25000,
        current_income: 1900
      };
      component.existingCashString = '$25,352.63';
      component.currentIncomeString = '$1,937.55';

      component.convertStringToNumber();

      expect(component.selectedBudget.existing_cash).toEqual(25352.63);
      expect(component.selectedBudget.current_income).toEqual(1937.55);
    }));
  });

  describe('#createBudget(budget)', () => {
    it('should create a new budget', async(() => {
      let budget = {
        _id: 1,
        start_period: '2016-10-29',
        existing_cash: 25895.00,
        current_income: 1985.24
      };

      budgetService.content = 'some content';
      component.selectedBudget = budget;
      component.existingCashString = '$25,000.00';
      component.currentIncomeString = '$1,900.00';
      component.reuseProjection = false;

      component.createBudget(budget);

      expect(component.selectedBudget.start_period).toEqual(new Date('Sun Oct 29 2016 00:00:00 GMT-0700 (PDT)'));
      expect(component.selectedBudget.existing_cash).toEqual(25000);
      expect(component.selectedBudget.current_income).toEqual(1900);
      expect(budget).toEqual({
        _id: 1,
        start_period: new Date('Sat Oct 29 2016 00:00:00 GMT-0700 (PDT)'),
        existing_cash: 25000,
        current_income: 1900
      });
    }));
  });

  describe('#reuseProjection(budget)', () => {
    it('should copy the projection items from the previous array item', async(() => {
      let budgets = [
        {
          _id: 1,
          start_period: '2016-10-29',
          budget_items: [
            {
              editing: false,
              item: 'gas',
              projection: 200,
              actual: [
                {
                  name: 'Done 10/15',
                  amount: 35,
                  expense: true
                }
              ]
            }
          ]
        },
        {
          _id: 2,
          start_period: '2016-10-29',
          budget_items: [
            {
              editing: false,
              item: 'gas',
              projection: 200,
              actual: [
                {
                  name: 'Done 10/15',
                  amount: 35,
                  expense: true
                }
              ]
            }
          ]
        }
      ];

      let budget = {
        _id: 1,
        start_period: new Date('9/24/2016'),
        existing_cash: 22525,
        current_income: 1800,
        budget_items: [

        ]
      };

      component.budgets = budgets;
      budgetService.content = 'some content';
      component.reuseProjections(budget);
      expect(budget).toEqual({
        _id: 1,
        start_period: new Date('9/24/2016'),
        existing_cash: 22525,
        current_income: 1800,
        budget_items: [
          {
            editing: false,
            item: 'gas',
            projection: 200,
            actual: []
          }
        ]
      });
      expect(component.reuseProjectionsBudget).toEqual('some content');
    }));
  });

  describe('#obtainPreviousBudget(string)', () => {
    let budgets = [
      {
        item: 1,
        budget_items: [
          {
            fruit: 'apples',
            actual: [{amount: 15, expense: true}],
          }
        ]
      },
      {
        item: 2,
        budget_items: [
          {
            fruit: 'grapes',
            actual: [{amount: 25, expense: true}]
          }
        ]
      }
    ];

    it('should obtain previous budget', async(() => {
      component.budgets = budgets;
      expect(component.obtainPreviousBudget('pre')).toEqual(
        {
          item: 2,
          budget_items: [
            {
              fruit: 'grapes',
              actual: []
            }
          ]
        });
    }));

    it('should obtain previous, previous budget since new budget array was pushed on', async(() => {
      component.budgets = budgets;
      expect(component.obtainPreviousBudget('post')).toEqual(
        {
          item: 1,
          budget_items: [
            {
              fruit: 'apples',
              actual: []
            }
          ]
        });
    }));
  });

  describe('#addUpdate(budget)', () => {
    it('should add an update to an existing budget', () => {
      let budget = {
        _id: 1,
        start_period: '2016-12-25T08:00:00.000Z',
        existing_cash: 25000,
        current_income: 1900
      };

      budgetService.content = 'some content';
      component.selectedBudget = budget;
      component.existingCashString = '$25,000.00';
      component.currentIncomeString = '$1,900.00';
      component.addUpdate(budget);
      expect(budget.start_period).toEqual('2016-12-25T08:00:00.000Z');
      expect(budget.existing_cash).toEqual(25000);
      expect(budget.current_income).toEqual(1900);
    });
  });

  describe('#deleteBudget(budget)', () => {
    it('should delete a specific budget', () => {
      let budgets = [
        {
          _id: 1,
          start_period: '2016-10-29'
        },
        {
          _id: 2,
          start_period: '2016-10-29'
        },
        {
          _id: 3,
          start_period: '2016-10-29'
        }
      ];

      component.budgets = budgets;
      expect(component.budgets.length).toEqual(3);
      budgetService.content = budgets[0];
      component.deleteBudget(budgets[0]);
      expect(component.budgets.length).toEqual(2);
      expect(component.shownBudget).toEqual(budgets[2]);
    });
  });
});

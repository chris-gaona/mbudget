import { TestBed, async, ComponentFixture } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';

import {
  IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform, Keyboard,
  Form, AlertController, ToastController, NavParams
} from 'ionic-angular';

import { ConfigMock, MockNavParams, ToastControllerMock, NavControllerMock } from '../../mocks';
import { EditPage } from './edit';
import { BudgetService } from '../../services/budget.service';
import { AbstractMockObservableService } from '../../services/mock.service';

class MockService extends AbstractMockObservableService {
  updateBudgetById() {
    return this;
  }

  deleteBudgetItem() {
    return this;
  }
}

describe('Component: EditPage', () => {
  let fixture;
  let component;
  let budgetService;

  beforeEach(() => {
    budgetService = new MockService();

    TestBed.configureTestingModule({
      imports: [
        IonicModule
      ],
      declarations: [
        EditPage
      ],
      providers: [
        App,
        Platform,
        Form,
        Keyboard,
        MenuController,
        GestureController,
        DomController,
        AlertController,
        {provide: NavController, useClass: NavControllerMock},
        {provide: ToastController, useClass: ToastControllerMock},
        {provide: NavParams, useClass: MockNavParams},
        {provide: Config, useClass: ConfigMock}
      ]
    }).overrideComponent(EditPage, {
      set: {
        providers: [
          { provide: BudgetService, useValue: budgetService }
        ]
      }
    });

    // create component and test fixture
    fixture = TestBed.createComponent(EditPage);
    // get test component from the fixture
    component = fixture.componentInstance;
  });

  it('should create an instance', async(() => {
    expect(component).toBeTruthy();
    expect(component.hasValidationErrors).toBe(false);
    expect(component.loading).toBe(false);
  }));

  describe('#saveAll()', () => {
    let selectedBudget = {
      _id: 1,
      start_period: '2016-09-24T07:00:00.000Z',
      existing_cash: 22525,
      current_income: 1800,
      budget_items: [
        {
          editing: false,
          item: 'gas',
          projection: 200,
          actual: [
            {
              name: 'Done 10/15',
              amount: 35
            }
          ]
        }
      ]
    };

    it('should save all the items in the current budget', async(() => {
      budgetService.content = 'some content';
      component.selectedBudget = selectedBudget;
      component.saveAll();
      expect(component.saveAllData).toEqual('some content');
    }));

    it('should handle error with saveAll()', async(() => {
      class Error {
        statusText: any;
        status: any;
      }
      let error = new Error();
      error.statusText = 'Sorry no message.';
      error.status = 500;
      budgetService.error = error;
      component.selectedBudget = selectedBudget;
      component.saveAll();
      expect(component.errorMessage).toMatch(/Sorry no message/);
    }));

    it('should handle error with saveAll() when no message', async(() => {
      budgetService.error = new Error();
      component.selectedBudget = selectedBudget;
      component.saveAll();
      expect(component.errorMessage).toMatch(/Please try again./);
    }));
  });

  describe('#capitalizeFirstLetter(str)', () => {
    it('should capitalize the first letter of every word in the string', () => {
      expect(component.capitalizeFirstLetter('i walked the dog')).toEqual('I Walked The Dog');
    });
  });

  describe('#addActualItem(actual), #deleteActual(budget, actual)', () => {
    let budget = {
      id: 1,
      start_period: '9/24/2016',
      existing_cash: 22525,
      current_income: 1800,
      budget_items: [
        {
          editing: false,
          item: 'gas',
          projection: 200,
          actual: [
            {
              name: 'Done 10/15',
              amount: 35
            }
          ]
        },
        {
          editing: false,
          item: 'food',
          projection: 250,
          actual: [
            {
              name: 'Trader Joe\'s',
              amount: 125
            }
          ]
        }
      ]
    };

    it('should add a new actual item', async(() => {
      expect(budget.budget_items[0].actual.length).toEqual(1);
      component.addActualItem(budget.budget_items[0].actual);
      expect(budget.budget_items[0].actual.length).toEqual(2);
      expect(budget.budget_items[0].actual[1].name).toEqual('');
      expect(budget.budget_items[0].actual[1].amount).toEqual(0);
    }));

    it('should not find the actual item to delete and handle it', async(() => {
      expect(budget.budget_items[0].actual.length).toEqual(2);
      component.deleteActual(budget.budget_items[0], 'Applesauce 123');
      expect(budget.budget_items[0].actual.length).toEqual(2);
    }));

    it('should delete specific actual item within a budget item', async(() => {
      expect(budget.budget_items[0].actual.length).toEqual(2);
      component.deleteActual(budget.budget_items[0], 'Done 10/15 $35');
      expect(budget.budget_items[0].actual.length).toEqual(1);
    }));
  });

  describe('#deleteBudgetItem(budgetItem)', () => {
    let budget = {
      id: 1,
      start_period: '9/24/2016',
      existing_cash: 22525,
      current_income: 1800,
      budget_items: [
        {
          editing: false,
          item: 'gas',
          projection: 200,
          actual: [
            {
              name: 'Done 10/15',
              amount: 35
            }
          ]
        },
        {
          editing: false,
          item: 'food',
          projection: 250,
          actual: [
            {
              name: 'Trader Joe\'s',
              amount: 125
            }
          ]
        }
      ]
    };

    it('should handle when the budget item does not exist', async(() => {
      component.budget = budget;
      expect(component.budget.budget_items.length).toEqual(2);
      component.deleteBudgetItem({name: 'apples'});
      expect(component.budget.budget_items.length).toEqual(2);
      expect(component.budget.budget_items[0].item).toEqual('gas');
      expect(component.budget.budget_items[0].projection).toEqual(200);
    }));

    it('should delete a specific budget item within a budget', async(() => {
      component.budget = budget;
      expect(component.budget.budget_items.length).toEqual(2);
      component.deleteBudgetItem(budget.budget_items[0]);
      expect(component.budget.budget_items.length).toEqual(1);
      expect(component.budget.budget_items[0].item).toEqual('food');
      expect(component.budget.budget_items[0].projection).toEqual(250);
    }));
  });

  describe('#getActualTotal(budget)', () => {
    let budgetItem = {
      _id: 1,
      start_period: '9/24/2016',
      existing_cash: 22525,
      current_income: 1800,
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
            },
            {
              name: 'Done',
              amount: 15,
              expense: false
            }
          ]
        },
        {
          editing: false,
          item: 'food',
          projection: 250,
          actual: [
            {
              name: 'Trader Joe\'s',
              amount: 125,
              expense: false
            }
          ]
        }
      ]
    };

    it('should calculate the sub total for each budget item', async(() => {
      component.totalActual = 0;
      expect(component.totalActual).toEqual(0);
      component.getActualTotal(budgetItem.budget_items[0]);
      expect(component.totalActual).toEqual(20);
    }));
  });

  describe('#toggleAddSubtract(actual)', () => {
    let budgetItem = {
      _id: 1,
      start_period: '9/24/2016',
      existing_cash: 22525,
      current_income: 1800,
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
    };

    it('should toggle between plus & minus of a number', () => {
      expect(budgetItem.budget_items[0].actual[0].expense).toBe(true);
      component.toggleAddSubtract(budgetItem.budget_items[0].actual[0]);
      expect(budgetItem.budget_items[0].actual[0].expense).toBe(false);
    });
  });
});

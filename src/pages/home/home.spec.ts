import { TestBed, async } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { DebugElement } from '@angular/core';

import {
  IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform, Keyboard,
  Form, PopoverController, ModalController, AlertController, ToastController
} from 'ionic-angular';

import { ConfigMock, ToastControllerMock, NavControllerMock, ModalControllerMock } from '../../mocks';
import { HomePage } from './home';
import { UserService } from '../../services/user.service';
import { BudgetService } from '../../services/budget.service';
import { NetworkService } from '../../services/network.service';
import { AbstractMockObservableService } from '../../services/mock.service';
import { RoundProgressModule } from 'angular-svg-round-progressbar/dist/round-progress';

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

  addBudget() {
    return this;
  }

  isLoggedIn(boolean) {
    return this;
  }
}

describe('Component: HomePage', () => {
  let fixture;
  let component;
  let userService;
  let budgetService;

  beforeEach(() => {
    userService = new MockService();
    budgetService = new MockService();

    TestBed.configureTestingModule({
      imports: [
        IonicModule,
        RoundProgressModule
      ],
      declarations: [
        HomePage
      ],
      providers: [
        App,
        Platform,
        Form,
        Keyboard,
        MenuController,
        GestureController,
        DomController,
        PopoverController,
        AlertController,
        {provide: ModalController, useClass: ModalControllerMock},
        {provide: NavController, useClass: NavControllerMock},
        {provide: ToastController, useClass: ToastControllerMock},
        {provide: Config, useClass: ConfigMock}
      ]
    }).overrideComponent(HomePage, {
      set: {
        providers: [
          { provide: UserService, useValue: userService },
          { provide: BudgetService, useValue: budgetService },
          { provide: NetworkService, useValue: budgetService }
        ]
      }
    });

    // create component and test fixture
    fixture = TestBed.createComponent(HomePage);
    // get test component from the fixture
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
    expect(component.visibleBudgets).toBe(true);
    expect(component.edited).toBe(false);
    expect(component.hasValidationErrors).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.projActual).toEqual('actual');
    expect(component.visibleTitle).toBe(true);
  });

  describe('#ngOnInit()', () => {
    it('should call the checkUserAuth() function within this', () => {
      spyOn(component, 'checkUserAuth');
      component.ngOnInit();
      fixture.detectChanges();
      expect(component.checkUserAuth).toHaveBeenCalled();
    });
  });

  describe('#ngAfterViewInit', () => {
    it('should call the checkScroll() function within this', () => {
      spyOn(component, 'checkScroll');
      component.ngAfterViewInit();
      fixture.detectChanges();
      expect(component.checkScroll).toHaveBeenCalled();
    });
  });

  describe('#loggedInUser()', () => {
    it('should get the currently logged in user', async(() => {
      let user = {username: 'jake123', firstName: 'Jake'};
      userService.content = user;
      component.loggedInUser();
      expect(component.currentUser).toBe(user);
    }));

    it('should call the function to open the model if no logged in user', () => {
      class Error {
        statusText: any;
        status: any;
      }
      let error = new Error();
      error.statusText = 'No user found. Open login';
      error.status = 404;
      userService.error = error;
      component.loggedInUser();
      expect(component.errorMessage).toMatch(/No user found. Open login/);
    });
  });

  describe('#getAllBudgets()', () => {
    let budgets = [{
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
    },
      {
        _id: 2,
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
      },
      {
        _id: 3,
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
          }
        ]
      }];

    it('should get all budgets & return budgets', async(() => {
      budgetService.content = budgets;
      component.visibleBudgets = false;
      component.getAllBudgets();
      expect(component.budgets).toBe(budgets);
      expect(component.visibleBudgets).toBe(true);
      expect(component.selectedBudget).toBe(budgets[2]);
    }));

    it('should handle when there are no budgets', () => {
      budgetService.content = [];
      component.visibleBudgets = true;
      component.getAllBudgets();
      expect(component.budgets).toBe(null);
      expect(component.visibleBudgets).toBe(false);
    });

    it('should handle when edited budget is passed in', () => {
      budgetService.content = budgets;
      component.visibleBudgets = false;
      component.getAllBudgets(budgets[0]);
      expect(component.budgets).toBe(budgets);
      expect(component.visibleBudgets).toBe(true);
      expect(component.selectedBudget).toBe(budgets[0]);
    });

    it('should handle an error in the response from the server', () => {
      class Error {
        statusText: any;
        status: any;
      }
      let error = new Error();
      error.statusText = 'Sorry no budgets found.';
      error.status = 404;
      budgetService.error = error;
      component.getAllBudgets();
      expect(component.errorMessage).toMatch(/Sorry no budgets found./);
    });
  });

  describe('#getAverageSaving(budgets)', () => {
    let budgets = [{
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
        }
      ]
    },
    {
      _id: 2,
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
              expense: true
            }
          ]
        }
      ]
    }];

    it('should get all budgets & return budgets', async(() => {
      expect(component.getAverageSaving(budgets)).toEqual(0.9805555555555556);
    }));
  });

  describe('#createFirstBudget', () => {
    let budget = {
      _id: 1,
      start_period: new Date('9/24/2016'),
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

    it('should create the first budget for a new user', () => {
      budgetService.content = budget;
      component.createFirstBudget();
      expect(component.selectedBudget).toEqual(budget);
      expect(component.visibleBudgets).toBe(true);
      expect(component.loading).toBe(false);
    });

    it('should handle an error', () => {
      class Error {
        statusText: any;
        status: any;
      }
      let error = new Error();
      error.statusText = 'Sorry first budget not created.';
      error.status = 500;
      budgetService.error = error;
      component.createFirstBudget();
      expect(component.errorMessage).toMatch(/Sorry first budget not created./);
    });
  });

  describe('#createEmptyBudget()', () => {
    let budgets = [{
      _id: 1,
      start_period: new Date('9/24/2016'),
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
    }];

    it('should create a new empty budget', () => {
      component.budgets = budgets;
      component.createEmptyBudget();
      expect(component.selectedBudget).toBeDefined();
      expect(component.budgets.length).toEqual(2);
    });
  });

  describe('#convertDate(budget, date)', () => {
    it('should convert the date to yyyy-mm-dd format', async(() => {
      let budget = {
        start_period: 'apples'
      };
      let date = new Date('10/29/2016');
      expect(component.convertDate(budget, date)).toEqual('2016-10-29');

      let newDate = new Date('1/5/2016');
      expect(component.convertDate(budget, newDate)).toEqual('2016-01-05');

      let anotherDate = new Date('1/15/2016');
      expect(component.convertDate(budget, anotherDate)).toEqual('2016-01-15');

      let stillAnotherDate = new Date('12/1/2016');
      expect(component.convertDate(budget, stillAnotherDate)).toEqual('2016-12-01');
    }));
  });

  describe('#obtainPreviousBudget(string)', () => {
    let budgets = [
      {
        item: 1,
        budget_items: [
          {
            fruit: 'apples',
            actual: [{ amount: 15, expense: true }],
          }
        ]
      },
      {
        item: 2,
        budget_items: [
          {
            fruit: 'grapes',
            actual: [{ amount: 25, expense: true }]
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

  describe('#openModalNew()', () => {
    it('should call the createEmptyBudget() function', () => {
      spyOn(component, 'createEmptyBudget');
      component.openModalNew();
      fixture.detectChanges();
      expect(component.createEmptyBudget).toHaveBeenCalled();
    });
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
      component.selectedBudget = budget;
      expect(component.selectedBudget.budget_items.length).toEqual(2);
      component.deleteBudgetItem({name: 'apples'});
      expect(component.selectedBudget.budget_items.length).toEqual(2);
      expect(component.selectedBudget.budget_items[0].item).toEqual('gas');
      expect(component.selectedBudget.budget_items[0].projection).toEqual(200);
    }));

    it('should delete a specific budget item within a budget', async(() => {
      component.selectedBudget = budget;
      expect(component.selectedBudget.budget_items.length).toEqual(2);
      component.deleteBudgetItem(budget.budget_items[0]);
      expect(component.selectedBudget.budget_items.length).toEqual(1);
      expect(component.selectedBudget.budget_items[0].item).toEqual('food');
      expect(component.selectedBudget.budget_items[0].projection).toEqual(250);
    }));
  });

  describe('#deleteActual(budget, actual)', () => {
    let budget = {
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
              amount: 35
            },
            {
              name: 'Trader Joe\'s',
              amount: 125
            }
          ]
        }
      ]
    };

    it('should delete specific actual item within a budget item', async(() => {
      component.selectedBudget = budget;
      expect(budget.budget_items[0].actual.length).toEqual(2);
      component.deleteActual(budget.budget_items[0], budget.budget_items[0].actual[1]);
      expect(budget.budget_items[0].actual.length).toEqual(1);
    }));
  });

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

    it('should handle when error in the response from server', async(() => {
      class Error {
        statusText: any;
        status: any;
      }
      let error = new Error();
      error.statusText = 'Sorry you cannot save';
      error.status = 500;
      budgetService.error = error;
      component.selectedBudget = selectedBudget;
      component.saveAll();
      expect(component.errorMessage).toMatch(/Sorry you cannot save/);
    }));

    it('should handle error with saveAll() when no message', async(() => {
      budgetService.error = new Error();
      component.selectedBudget = selectedBudget;
      component.saveAll();
      expect(component.errorMessage).toMatch(/Please try again./);
    }));
  });

  describe('#addBudgetItem()', () => {
    let budget = {
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
              amount: 35
            },
            {
              name: 'Trader Joe\'s',
              amount: 125
            }
          ]
        }
      ]
    };

    it('should save all items including budget items and actual items', async(() => {
      component.selectedBudget = budget;
      expect(component.selectedBudget.budget_items.length).toEqual(1);
      component.addBudgetItem();
      expect(component.selectedBudget.budget_items.length).toEqual(2);
      expect(component.selectedBudget.budget_items[1].item).toEqual('');
      expect(component.selectedBudget.budget_items[1].projection).toEqual(0);
    }));
  });

  describe('#getTotalSpent()', () => {
    let budget = {
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
              name: 'Trader Joe\'s',
              amount: 125,
              expense: true
            }
          ]
        }
      ]
    };

    it('should calculate total spent for actual', async(() => {
      component.totalSpent = 0;
      component.totals = [];
      component.mergeTotals = 0;
      component.selectedBudget = budget;
      component.getTotalSpent(budget, 'actual');
      expect(component.totalSpent).toEqual(160);
      expect(component.actualObject).toEqual({
        totalSpent: 160,
        totalSaving: 1640,
        percSaving: 0.9111111111111111,
        endingCash: 24165
      });
    }));

    it('should calculate total spent for projection', async(() => {
      component.totalSpent = 0;
      component.selectedBudget = budget;
      component.getTotalSpent(budget, 'projection');
      expect(component.totalSpent).toEqual(200);
      expect(component.projectionObject).toEqual({
        totalSpent: 200,
        totalSaving: 1600,
        percSaving: 0.8888888888888888,
        endingCash: 24125
      });
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

  describe('#toggleAddSubtract', () => {
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
      component.selectedBudget = budgetItem;
      expect(budgetItem.budget_items[0].actual[0].expense).toBe(true);
      component.toggleAddSubtract(budgetItem.budget_items[0].actual[0]);
      expect(budgetItem.budget_items[0].actual[0].expense).toBe(false);
    });
  });

  describe('#parseDate(date)', () => {
    it('should parse a date & return appropriate text', async(() => {
      let budget = {
        _id: 1,
        start_period: new Date('9/24/2016'),
        updatedAt: "2017-01-02T22:35:26.450Z"
      };

      expect(component.parseDate(budget.updatedAt)).toMatch(/\b(?:now|ago)\b/gi);
    }));

    it('should parse a date & return appropriate text with different date', async(() => {
      let budget = {
        _id: 1,
        start_period: new Date('9/24/2016'),
        updatedAt: "2016-10-16T22:35:26.450Z"
      };

      expect(component.parseDate(budget.updatedAt)).toEqual('Oct 16');
    }));
  });
});

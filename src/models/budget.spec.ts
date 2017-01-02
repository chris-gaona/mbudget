/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
// import { TestBed, async } from '@angular/core/testing';
import { Budget, BudgetItems, ActualItems } from './budget';

describe('Budget', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [

      ]
    });
  });

  it('should create an instance', () => {
    expect(new Budget()).toBeTruthy();
  });

  it('should accept values in the constructor', () => {
    let actualItems = new ActualItems(
      {
        _id: 1,
        name: 'Done 10/15'
      }
    );

    let budgetItems = new BudgetItems(
      {
        _id: 1,
        item: 'gas',
        projection: 200,
        actual: [actualItems]
      }
    );

    let budget = new Budget({
      _id: 1,
      updatedAt: new Date('10/30/2016'),
      createdAt: new Date('11/01/2016'),
      start_period: new Date('10/29/2016'),
      existing_cash: 22525,
      budget_items: [budgetItems]
    });

    expect(budget._id).toEqual(1);
    expect(budget.updatedAt).toEqual(new Date('10/30/2016'));
    expect(budget.createdAt).toEqual(new Date('11/01/2016'));
    expect(budget.start_period).toEqual(new Date('10/29/2016'));
    expect(budget.existing_cash).toEqual(22525);
    expect(budget.current_income).toEqual(0);
    expect(budget.budget_items[0].editing).toEqual(false);
    expect(budget.budget_items[0]._id).toEqual(1);
    expect(budget.budget_items[0].item).toEqual('gas');
    expect(budget.budget_items[0].projection).toEqual(200);
    expect(budget.budget_items[0].actual[0].name).toEqual('Done 10/15');
    expect(budget.budget_items[0].actual[0]._id).toEqual(1);
    expect(budget.budget_items[0].actual[0].amount).toEqual(0);
    expect(budget.budget_items[0].actual[0].expense).toEqual(true);
  });
});

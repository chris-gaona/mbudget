import * as moment from 'moment';

export class Budget {
  $key: any;
  $exists: any;
  _id: number;
  updatedAt: any;
  createdAt: any;
  start_period: any = moment().format();
  existing_cash: any = 0;
  current_income: any = 0;
  budget_items: any = [new BudgetItems()];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class BudgetItems {
  _id: number;
  paid: boolean;
  due: boolean;
  due_date: any;
  editing: boolean = false;
  item: string = '';
  projection: number = 0;
  actual: any = [new ActualItems()];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class ActualItems {
  _id: number;
  name: string = '';
  amount: number = 0;
  expense: boolean = true;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

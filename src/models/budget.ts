export class Budget {
  _id: any;
  updatedAt: any;
  createdAt: any;
  start_period: any = new Date();
  existing_cash: number = 0;
  current_income: number = 0;
  budget_items: any = [new BudgetItems()];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class BudgetItems {
  _id: any;
  editing: boolean = false;
  item: string = '';
  projection: number = 0;
  actual: any = [new ActualItems()];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class ActualItems {
  _id: any;
  name: string = '';
  amount: number = 0;
  expense: boolean = true;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

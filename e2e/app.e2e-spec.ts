import { browser, element, by } from 'protractor';

describe('BudTrac App: home.html & userInfo.ts', () => {
  browser.get('');

  it('should have a title', () => {
    expect(browser.getTitle()).toEqual('BudTrac');
  });

  it('should have a toolbar section with BudTrac title', () => {
    let toolbar = element(by.css('ion-toolbar'));

    expect(toolbar.isPresent()).toBeTruthy();
    expect(toolbar.getText()).toEqual('BudTrac');
  });

  it('should have popover when clicking on user button', () => {
    //todo: need to updated this section once I add login functionality
    let userButton = element.all(by.css('button')).get(0);

    userButton.click();
    browser.sleep(500);

    expect(element(by.css('.popover-item ion-list-header')).getText()).toEqual('User Info');
    expect(element(by.css('.popover-item ion-avatar')).isPresent()).toBeTruthy();
    expect(element(by.css('.popover-item h2')).getText()).toMatch(/Hello, [a-z]+/i);
    expect(element(by.css('.popover-item p')).getText()).toEqual('Enjoy today!');
    expect(element(by.css('.popover-item button')).getText()).toEqual('LOGOUT');
  });

  it('should remove popover when click on ion-backdrop', () => {
    element(by.css('ion-backdrop')).click();
    browser.sleep(700);

    expect(element(by.css('.popover-item')).isPresent()).toBeFalsy();
  });

  it('should have a health snapshot section', () => {
    let healthSnapshot = element(by.id('health-snapshot'));
    let healthIcon = element(by.id('health-icon'));

    expect(healthIcon.isPresent()).toBeTruthy();
    expect(healthSnapshot.isPresent()).toBeTruthy();
    expect(healthSnapshot.getText()).toEqual('Health Snapshot');
  });

  it('should have a select field to choose period', () => {
    let select = element(by.id('select-container'));

    expect(select.getText()).toEqual('Period\nNov 21, 2016');
    expect(element(by.css('ion-select')).isPresent()).toBeTruthy();
  });

  it('should have a last updated display section', () => {
    expect(element.all(by.css('.small-text')).get(0).getText()).toEqual('Last Updated - 1 day ago');
  });

  it('should have totals sections', () => {
    let totalDollars = element(by.id('total-dollars'));
    let totalIncome = element(by.id('total-income'));
    let totalExpense = element(by.id('total-expense'));

    expect(totalDollars.isPresent()).toBeTruthy();
    expect(totalDollars.getText()).toMatch(/^Total: \$[0-9]{0,3}(,)*[0-9]{1,3}\.?[0-9]{0,2}$/i);
    expect(totalIncome.isPresent()).toBeTruthy();
    expect(totalIncome.getText()).toMatch(/^Income: \$[0-9]{0,3}(,)*[0-9]{1,3}\.?[0-9]{0,2}$/i);
    expect(totalExpense.isPresent()).toBeTruthy();
    expect(totalExpense.getText()).toMatch(/^Expense: \$[0-9]{0,3}(,)*[0-9]{1,3}\.?[0-9]{0,2}$/i);
  });

  it('should have an hr divider', () => {
    expect(element(by.css('hr')).isPresent()).toBeTruthy();
  });

  it('should have a segment section', () => {
    expect(element(by.css('ion-segment')).getText()).toEqual('PROJECTION\nACTUAL');
  });

  it('should have Projection or Actual as the title of the first list', () => {
    expect(element.all(by.css('ion-list-header')).get(0).getText()).toMatch(/(Projection|Actual)/);
  });

  //todo: add tests for projection/actual list items

  it('should have Total as the title for the second list', () => {
    expect(element.all(by.css('ion-list-header')).get(1).getText()).toEqual('Totals');
  });

  it('should have 4 main sections in Total list', () => {
    let totalsList = element.all(by.css('.totals-list ion-item'));

    expect(totalsList.get(0).getText()).toMatch(/^Spent\n\$[0-9]{0,3}(,)*[0-9]{1,3}\.?[0-9]{0,2}$/i);
    expect(totalsList.get(1).getText()).toMatch(/^Saving\n\$[0-9]{0,3}(,)*[0-9]{1,3}\.?[0-9]{0,2}$/i);
    expect(totalsList.get(2).getText()).toMatch(/^% Saving\n[0-9]{1,2}(%)$/i);
    expect(totalsList.get(3).getText()).toMatch(/^Ending Cash\n\$[0-9]{0,3}(,)*[0-9]{1,3}\.?[0-9]{0,2}$/i);
  });

  it('should have a footer container with specific text', () => {
    expect(element(by.id('footer-container')).isPresent()).toBeTruthy();
    expect(element.all(by.css('.small-text')).get(1).getText()).toEqual('Follow @chrissgaona');
  });

  it('should have an add + button floating in the bottom right', () => {
    expect(element(by.css('ion-fab')).isPresent()).toBeTruthy();
  });
});

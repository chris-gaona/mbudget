import { browser, element, by } from 'protractor';

describe('BudTrac App: edit.html', () => {

  it('should add edit page when projection/actual list item clicked', () => {
    let listItem = element.all(by.css('.projActualItem'));

    listItem.get(0).click();
    browser.sleep(500);

    expect(element(by.css('ion-header')).isPresent()).toBeTruthy();
  });

  it('should have header title text saying Edit Item', () => {
    expect(element(by.css('ion-navbar ion-title')).getText()).toEqual('Edit Item');
  });

  it('should have edit container with proper title', () => {
    expect(element(by.id('edit-container')).isPresent()).toBeTruthy();
    expect(element(by.css('.edit-header')).getText()).toMatch(/[a-z]+/i);
  });

  //todo: add tests for edit-subcontainer elements

  it('should go back to the home page when back is clicked', () => {
    element(by.css('.back-button')).click();
    browser.sleep(500);

    expect(element(by.id('edit-container')).isPresent()).toBeFalsy();
  });

  //todo: add tests for Save, Add New Item, and Delete buttons
});

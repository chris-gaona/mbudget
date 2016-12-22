import { browser, element, by } from 'protractor';

describe('BudTrac App: modalContent.html', () => {

  it('should add a modal when settings button is clicked', () => {
    let settingsButton = element.all(by.css('button')).get(1);

    settingsButton.click();
    browser.sleep(500);

    expect(element(by.id('modal-title')).getText()).toMatch(/(Making some changes!|Let\'s track your pay!)/i);
  });

  it('should have a modal container with sub text', () => {
    expect(element(by.id('modal-container')).isPresent()).toBeTruthy();

    // todo: add tests for sub text
  });

  it('should have the proper labels & fields', () => {
    let labels = element.all(by.css('.input-header'));

    expect(labels.get(0).getText()).toEqual('When does the current period start?');
    expect(labels.get(1).getText()).toEqual('What is your current cash?');
    expect(labels.get(2).getText()).toEqual('What is your current income?');

    let inputs = element.all(by.css('input'));

    expect(element(by.css('ion-datetime')).getText()).toMatch(/[a-z]{3} [0-9]{2} [0-9]{4}/i);
    expect(inputs.get(0).getAttribute('value')).toMatch(/^\$ [0-9]{0,3}(,)*[0-9]{1,3}\.?[0-9]{0,2}$/i);
    expect(inputs.get(1).getAttribute('value')).toMatch(/^\$ [0-9]{0,3}(,)*[0-9]{1,3}\.?[0-9]{0,2}$/i);
  });

  it('should have a css dog at the bottom', () => {
    expect(element(by.css('.dog-container')).isPresent()).toBeTruthy();
  });

  //todo: add tests for when modal is opened with new + FAB is clicked
});

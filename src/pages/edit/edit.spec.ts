// import { TestBed } from '@angular/core/testing';
// // import { TestBed, async, ComponentFixture } from '@angular/core/testing';
// // import { By } from '@angular/platform-browser';
// // import { DebugElement } from '@angular/core';
//
// import {
//   IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform, Keyboard,
//   Form, AlertController, ToastController, NavParams
// } from 'ionic-angular';
//
// import { ConfigMock, MockNavParams } from '../../mocks';
// import { EditPage } from './edit';
// import { BudgetService } from '../../services/budget.service';
// import { AbstractMockObservableService } from '../../services/mock.service';
//
// class MockService extends AbstractMockObservableService {
//
// }
//
// describe('Component: EditPage', () => {
//   let fixture;
//   let component;
//   let budgetService;
//
//   beforeEach(() => {
//     budgetService = new MockService();
//
//     TestBed.configureTestingModule({
//       imports: [
//         IonicModule
//       ],
//       declarations: [
//         EditPage
//       ],
//       providers: [
//         App,
//         Platform,
//         Form,
//         Keyboard,
//         MenuController,
//         NavController,
//         GestureController,
//         DomController,
//         AlertController,
//         ToastController,
//         {provide: NavParams, useClass: MockNavParams},
//         {provide: Config, useClass: ConfigMock}
//       ]
//     }).overrideComponent(EditPage, {
//       set: {
//         providers: [
//           { provide: BudgetService, useValue: budgetService }
//         ]
//       }
//     });
//
//     // create component and test fixture
//     fixture = TestBed.createComponent(EditPage);
//     // get test component from the fixture
//     component = fixture.componentInstance;
//   });
//
//   it('should create an instance', () => {
//     expect(component).toBeTruthy();
//   });
// });

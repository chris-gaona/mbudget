// import { TestBed, async, ComponentFixture } from '@angular/core/testing';
// // import { By } from '@angular/platform-browser';
// // import { DebugElement } from '@angular/core';
//
// import {
//   IonicModule, Config, GestureController, DomController, App, MenuController, NavController, Platform, Keyboard,
//   Form, PopoverController, ModalController, AlertController
// } from 'ionic-angular';
//
// import { ConfigMock } from '../../mocks';
// import { HomePage } from './home';
// import { UserService } from '../../services/user.service';
// import { AbstractMockObservableService } from '../../services/mock.service';
//
// class MockService extends AbstractMockObservableService {
//   getAllBudgets() {
//     return this;
//   }
//
//   getUser() {
//     return this;
//   }
//
//   updateBudgetById() {
//     return this;
//   }
// }
//
// describe('Component: HomePage', () => {
//   let fixture;
//   let component;
//   let userService;
//
//   beforeEach(() => {
//     userService = new MockService();
//
//     TestBed.configureTestingModule({
//       imports: [
//         IonicModule
//       ],
//       declarations: [
//         HomePage
//       ],
//       providers: [
//         App, Platform, Form, Keyboard, MenuController, NavController, GestureController, DomController,
//         PopoverController, ModalController, AlertController,
//         {provide: Config, useClass: ConfigMock}
//       ]
//     }).overrideComponent(HomePage, {
//       set: {
//         providers: [
//           { provide: UserService, useValue: userService }
//         ]
//       }
//     });
//
//     // create component and test fixture
//     fixture = TestBed.createComponent(HomePage);
//     // get test component from the fixture
//     component = fixture.componentInstance;
//   });
//
//   it('should create an instance', () => {
//     expect(component).toBeTruthy();
//   });
//
//   describe('#loggedInUser()', () => {
//     it('should get the currently logged in user', async(() => {
//       let user = {username: 'jake123', firstName: 'Jake'};
//       userService.content = user;
//       component.loggedInUser();
//       expect(component.currentUser).toBe(user);
//     }));
//   });
// });

import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { EditPage } from '../pages/edit/edit';
import { HomePage } from '../pages/home/home';
import { PopoverPage } from '../pages/popovers/userInfo';
import { ModalContentPage } from '../pages/modals/modalContent';
import { NetworkService } from '../services/network.service';
import { ChartsModule } from 'ng2-charts';
import { TextMaskModule } from 'angular2-text-mask';
import { FormsModule } from '@angular/forms';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { WelcomePage } from '../pages/welcome/welcome';
import { PopoverDueDatePage } from '../pages/popovers/dueDate';
import {RoundProgressModule} from "angular-svg-round-progressbar";
// Importing Providers
import { AuthData } from '../providers/auth-data';
// Import the AF2 Module
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import * as config from '../assets/config.json';


// AF2 Settings
export const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  databaseURL: config.databaseURL,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId
};

const myFirebaseAuthConfig = {
  provider: AuthProviders.Password,
  method: AuthMethods.Password
};


@NgModule({
  declarations: [
    MyApp,
    EditPage,
    HomePage,
    PopoverPage,
    ModalContentPage,
    LoginPage,
    SignupPage,
    ResetPasswordPage,
    WelcomePage,
    PopoverDueDatePage
  ],
  imports: [
    IonicModule.forRoot(MyApp, {
      platforms: {
        ios: {
          statusbarPadding: true
        }
      }
    }),
    AngularFireModule.initializeApp(firebaseConfig, myFirebaseAuthConfig),
    ChartsModule,
    RoundProgressModule,
    FormsModule,
    TextMaskModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    EditPage,
    HomePage,
    PopoverPage,
    ModalContentPage,
    LoginPage,
    SignupPage,
    ResetPasswordPage,
    WelcomePage,
    PopoverDueDatePage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler},
    NetworkService,
    AuthData
  ]
})
export class AppModule {}

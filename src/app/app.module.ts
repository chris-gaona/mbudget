import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { EditPage } from '../pages/edit/edit';
import { HomePage } from '../pages/home/home';
// import { TabsPage } from '../pages/tabs/tabs';
import { PopoverPage } from '../pages/popovers/userInfo';
import { ModalContentPage } from '../pages/modals/modalContent';
import { ModalAuthPage } from '../pages/modals/modalAuth';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { UserService } from '../services/user.service';
import { AUTH_PROVIDERS } from 'angular2-jwt';


@NgModule({
  declarations: [
    MyApp,
    EditPage,
    HomePage,
    // TabsPage,
    PopoverPage,
    ModalContentPage,
    ModalAuthPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    CurrencyMaskModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    EditPage,
    HomePage,
    // TabsPage,
    PopoverPage,
    ModalContentPage,
    ModalAuthPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, UserService, AUTH_PROVIDERS]
})
export class AppModule {}

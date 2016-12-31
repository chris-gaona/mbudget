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
import { BudgetService } from '../services/budget.service';
import { NetworkService } from '../services/network.service';
import { ChartsModule } from 'ng2-charts';
import { RoundProgressModule } from 'angular-svg-round-progressbar/dist/round-progress';


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
    IonicModule.forRoot(MyApp, {
      platforms: {
        ios: {
          statusbarPadding: true
        }
      }
    }),
    CurrencyMaskModule,
    ChartsModule,
    RoundProgressModule
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
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, UserService, BudgetService, AUTH_PROVIDERS, NetworkService]
})
export class AppModule {}

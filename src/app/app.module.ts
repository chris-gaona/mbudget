import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { EditPage } from '../pages/contact/edit';
import { HomePage } from '../pages/home/home';
// import { TabsPage } from '../pages/tabs/tabs';
import { PopoverPage } from '../pages/popovers/userInfo';
import { ModalContentPage } from '../pages/modals/modalContent';
import { CurrencyMaskModule } from 'ng2-currency-mask';


@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    EditPage,
    HomePage,
    // TabsPage,
    PopoverPage,
    ModalContentPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    CurrencyMaskModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    EditPage,
    HomePage,
    // TabsPage,
    PopoverPage,
    ModalContentPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}

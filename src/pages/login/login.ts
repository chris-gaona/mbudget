import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthData } from '../../providers/auth-data';

import { HomePage } from '../home/home';
import { SignupPage } from '../signup/signup';
import { ResetPasswordPage } from '../reset-password/reset-password';

import { EmailValidator } from '../../validators/email';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  loginForm: any;
  emailChanged: boolean = false;
  passwordChanged: boolean = false;
  submitAttempt: boolean = false;
  loading: any;

  constructor(public navCtrl: NavController,
              public authData: AuthData,
              public formBuilder: FormBuilder,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public toastCtrl: ToastController) {
    // initialize loginForm
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required,
        EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6),
        Validators.required])]
    });
  }

  // creates toast to display to user
  showToast(message:string, position: string, color: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: position,
      cssClass: color
    });

    toast.present(toast);
  }

  /**
   * Receives an input field and sets the corresponding fieldChanged property to 'true' to help with the styles.
   */
  elementChanged(input){
    let field = input.inputControl.name;
    this[field + "Changed"] = true;
  }

  /**
   * If the form is valid it will call the AuthData service to log the user in displaying a loading
   * component while the user waits.
   *
   * If the form is invalid it will just log the form value, feel free to handle that as you like.
   */
  // login user
  loginUser() {
    this.submitAttempt = true;

    this.loading = this.loadingCtrl.create({});

    this.loading.present();

    // if form is invalid log form value to console
    if (!this.loginForm.valid){
      console.log(this.loginForm.value);
      this.loading.dismiss();

    } else {
      // if form is valid attempt to log the user in with provided credentials
      this.authData.loginUser(this.loginForm.value.email,
        this.loginForm.value.password).then( authData => {
          // if login success set root as homepage
        this.navCtrl.setRoot(HomePage).then(() => {
          this.loading.dismiss();
          console.log('logged in!');
          // display toast to user
          this.showToast('Successfully logged in!', 'bottom', 'toaster-green');
        });
      }, error => {
        // if error occurred alert the error
        this.loading.dismiss().then( () => {
          let alert = this.alertCtrl.create({
            message: error.message,
            buttons: [
              {
                text: "Ok",
                role: 'cancel'
              }
            ]
          });
          alert.present();
        });
      });
    }
  }

  goToResetPassword(){
    this.navCtrl.push(ResetPasswordPage);
  }

  createAccount(){
    this.navCtrl.push(SignupPage);
  }
}

import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthData } from '../../providers/auth-data';
import { EmailValidator } from '../../validators/email';
import { HomePage } from '../home/home';


@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {

  signupForm;
  emailChanged: boolean = false;
  passwordChanged: boolean = false;
  submitAttempt: boolean = false;
  loading;

  constructor(public navCtrl: NavController,
              public authData: AuthData,
              public formBuilder: FormBuilder,
              public loadingCtrl: LoadingController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController) {
    // initialize signupForm
    this.signupForm = formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required,
        EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6),
        Validators.required])]
    });
  }

  // create toast for user
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
   * If the form is valid it will call the AuthData service to sign the user up password displaying a loading
   * component while the user waits.
   *
   * If the form is invalid it will just log the form value, feel free to handle that as you like.
   */
  signupUser(){
    this.submitAttempt = true;

    this.loading = this.loadingCtrl.create({});

    this.loading.present();

    // if form is invalid log form value to console
    if (!this.signupForm.valid){
      console.log(this.signupForm.value);
      this.loading.dismiss();

    } else {
      // else attempt to signup the user
      this.authData.signupUser(this.signupForm.value.email,
        this.signupForm.value.password).then(() => {
        // if signup success...update profile information passing in user's name
        this.authData.updateProfile(this.signupForm.value.name, '').then(() => {
          // on success....send a confirmation email to user
          this.authData.sendConfirmationEmail();
          // set homepage as root
          this.navCtrl.setRoot(HomePage).then(() => {
            this.loading.dismiss();
            this.showToast('Consider yourself registered!', 'bottom', 'toaster-green');
            // add alert letting user know confirmation email was sent
            setTimeout(() =>{
              let alert = this.alertCtrl.create({
                message: 'We sent you an email to confirm your email.',
                buttons: [{ text: 'Ok', role: 'cancel' }]
              });

              alert.present();
            }, 2000);
          });
        }, (err) => {
          console.log(err);
          // if error alert the error message to user
          let errorMessage: string = err.message;
          let alert = this.alertCtrl.create({
            message: errorMessage,
            buttons: [{ text: "Ok", role: 'cancel' }]
          });

          alert.present();
        });

      }, (error) => {
        // if main error alert error message to user
        this.loading.dismiss().then( () => {
          let errorMessage: string = error.message;
          let alert = this.alertCtrl.create({
            message: errorMessage,
            buttons: [{ text: "Ok", role: 'cancel' } ]
          });

          alert.present();
        });
      });

    }
  }
}

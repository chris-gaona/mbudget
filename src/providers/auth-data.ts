import { Injectable } from '@angular/core';

import { AngularFire, FirebaseAuthState } from 'angularfire2';

@Injectable()
export class AuthData {

  fireAuth: any;
  authState: FirebaseAuthState;
  user: any;

  constructor(public af: AngularFire) {
    af.auth.subscribe( user => {
      this.authState = user;

      if (user) {
        this.fireAuth = user.auth;
        console.log(user);
        this.user = af.database.list('/users/' + this.fireAuth.uid + '/user-info');
      }
    }, (err) => {
      console.log(err);
      this.fireAuth = null;
      this.user = null;
    });
  }

  getUserInfo(): any {
    return this.fireAuth;
  }

  getBudgets(): any {
    return this.af.database.list('/users/' + this.getUserInfo().uid + '/budgets', {
      query: {
        orderByChild: 'start_period',
      }
    });
  }

  loginUser(newEmail: string, newPassword: string): any {
    return this.af.auth.login({ email: newEmail, password: newPassword });
  }

  resetPassword(email: string): any {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  logoutUser(): any {
    return this.af.auth.logout();
  }

  signupUser(newEmail: string, newPassword: string): any {
    return this.af.auth.createUser({ email: newEmail, password: newPassword });
  }

  sendConfirmationEmail(): any {
    firebase.auth().onAuthStateChanged(function(user) {
      user.sendEmailVerification();
    });
  }

  updateProfile(displayName, photoURL): any {
    if (photoURL === '') {
      return this.authState.auth.updateProfile({displayName: displayName, photoURL: null});
    } else {
      return this.authState.auth.updateProfile({displayName: displayName, photoURL: photoURL});
    }
  }
}

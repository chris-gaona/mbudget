import { Injectable } from '@angular/core';

import { AngularFire, FirebaseAuthState } from 'angularfire2';

@Injectable()
export class AuthData {

  fireAuth: any;
  authState: FirebaseAuthState;
  user: any;
  subscription: any;
  budgets: any;

  constructor(public af: AngularFire) {
    // subscribe to check for user authentication
    this.subscription = af.auth.subscribe( user => {
      this.authState = user;

      // if user is authenticated assign data to fireAuth & user variables
      if (user) {
        this.fireAuth = user.auth;
        console.log(user);
        this.user = af.database.list('/users/' + this.fireAuth.uid + '/user-info');
      }
    }, (err) => {
      console.log(err);
      // else make sure variables are null
      this.fireAuth = null;
      this.user = null;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // simply return userInfo with data assigned to fireAuth variable above
  getUserInfo(): any {
    return this.fireAuth;
  }

  // get all budgets by user
  getBudgets(): any {
    return this.af.database.list('/users/' + this.getUserInfo().uid + '/budgets', {
      query: {
        orderByChild: 'start_period',
      }
    });
  }

  // attempt to login in a user
  loginUser(newEmail: string, newPassword: string): any {
    return this.af.auth.login({ email: newEmail, password: newPassword });
  }

  // reset the password of a user
  resetPassword(email: string): any {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  // logout a user
  logoutUser(): any {
    return this.af.auth.logout();
  }

  // sign up a user
  signupUser(newEmail: string, newPassword: string): any {
    return this.af.auth.createUser({ email: newEmail, password: newPassword });
  }

  // send a email verification to user after sign up
  sendConfirmationEmail(): any {
    firebase.auth().onAuthStateChanged(function(user) {
      user.sendEmailVerification();
    });
  }

  // update user profile with displayName and photoURL
  updateProfile(displayName, photoURL): any {
    if (photoURL === '') {
      return this.authState.auth.updateProfile({displayName: displayName, photoURL: null});
    } else {
      return this.authState.auth.updateProfile({displayName: displayName, photoURL: photoURL});
    }
  }
}

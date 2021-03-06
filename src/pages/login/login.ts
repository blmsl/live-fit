// App
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Auth, User, UserDetails } from '@ionic/cloud-angular';

// Providers
import { AuthValidationService } from '../../providers';

@IonicPage({
  name: 'login'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  private _history: string;
  public email: AbstractControl;
  public loginForm: FormGroup;
  public password: AbstractControl;
  constructor(
    private _alertCtrl: AlertController,
    private _auth: Auth,
    private _formBuilder: FormBuilder,
    private _loadCtrl: LoadingController,
    private _navCtrl: NavController,
    private _params: NavParams,
    private _user: User
  ) {
    this._history = _params.get('history');
    this.loginForm = _formBuilder.group({
      email: [
        '',
        Validators.compose([Validators.required, AuthValidationService.emailValidation,
        AuthValidationService.noWhiteSpaceValidation])
      ],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16),
        AuthValidationService.passwordValidation, AuthValidationService.noWhiteSpaceValidation])
      ]
    });
    this.email = this.loginForm.get('email');
    this.password = this.loginForm.get('password');
  }

  public forgotPassword(): void {
    this._navCtrl.setRoot('forgot-password', {
      history: this._history
    })
  }

  public login(form: { email: string, password: string }): void {
    let loader = this._loadCtrl.create({
      content: 'Please wait...',
      spinner: 'crescent',
      duration: 30000
    });
    loader.present();
    let details: UserDetails = {
      'email': form.email.trim(),
      'password': form.password.trim(),
    };
    this._auth.login('basic', details)
      .then(() => {
        loader.dismiss();
        if (this._history) {
          this._navCtrl.setRoot(this._history);
        } else {
          this._navCtrl.setRoot('fitness');
        }
      })
      .catch(err => {
        loader.dismiss();
        this._alertCtrl.create({
          title: 'Uhh ohh...',
          subTitle: 'Something went wrong',
          message: err.response.body.error.message,
          buttons: ['OK']
        }).present();
      });
  }

  public register(): void {
    this._navCtrl.setRoot('registration', {
      history: this._history
    })
  }
}

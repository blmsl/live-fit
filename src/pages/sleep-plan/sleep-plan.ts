// App
import { Component } from '@angular/core';
import { AlertController, IonicPage, Loading, LoadingController, NavController } from 'ionic-angular';
import { Auth } from '@ionic/cloud-angular';
import { Subscription } from 'rxjs/Subscription';

// Models
import { SleepHabit, SleepPlan } from '../../models';

// Providers
import { FitnessService, SleepService } from '../../providers';

@IonicPage({
  name: 'sleep-plan'
})
@Component({
  selector: 'page-sleep-plan',
  templateUrl: 'sleep-plan.html'
})
export class SleepPlanPage {
  private _sleepPlanSubscription: Subscription;
  public currentSleep: SleepHabit = new SleepHabit();
  public isDirty: boolean = false;
  public sleepPlan: SleepPlan;
  public sleepPlanDetails: string = 'guidelines';
  constructor(
    private _alertCtrl: AlertController,
    private _auth: Auth,
    private _fitSvc: FitnessService,
    private _loadCtrl: LoadingController,
    private _navCtrl: NavController,
    private _sleepSvc: SleepService
  ) { }

  public changedTime(): void {
    if (this.currentSleep.bedTime !== this.sleepPlan.sleepPattern[0].bedTime || this.currentSleep.wakeUpTime !== this.sleepPlan.sleepPattern[0].wakeUpTime) {
      this.currentSleep.duration = this._sleepSvc.getSleepDuration(this.currentSleep);
      this.isDirty = true;
    }
  }

  public saveSleep(): void {
    this._sleepSvc.saveSleep(this.sleepPlan, this.currentSleep);
    this.isDirty = false;
  }

  ionViewCanEnter(): boolean {
    if (!this._auth.isAuthenticated()) {
      this._navCtrl.setRoot('registration');
      return false;
    }
  }

  ionViewCanLeave(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isDirty) {
        this._alertCtrl.create({
          title: 'Discard changes',
          message: 'Changes have been made. Are you sure you want to leave?',
          buttons: [
            {
              text: 'Yes',
              handler: () => {
                resolve(true);
              }
            },
            {
              text: 'No',
              handler: () => {
                reject(true);
              }
            }
          ]
        }).present();
      } else {
        resolve(true);
      }
    });
  }

  ionViewWillEnter(): void {
    let loader: Loading = this._loadCtrl.create({
      content: 'Loading...',
      spinner: 'crescent',
      duration: 30000
    });
    loader.present();
    this._sleepPlanSubscription = this._sleepSvc.getSleepPlan$().subscribe((sleepPlan: SleepPlan) => {
      this.sleepPlan = Object.assign({}, sleepPlan);
      this.currentSleep = Object.assign({}, this._sleepSvc.getCurrentSleep(this.sleepPlan));
      loader.dismiss();
    }, (error: Error) => {
      loader.dismiss();
      this._alertCtrl.create({
        title: 'Uhh ohh...',
        subTitle: 'Something went wrong',
        message: error.toString(),
        buttons: ['OK']
      }).present();
    });
  }

  ionViewWillLeave(): void {
    this._sleepPlanSubscription.unsubscribe();
  }
}

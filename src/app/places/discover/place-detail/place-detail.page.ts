import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { BookingsService } from '../../../bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';
import { MapModalComponent } from '../../../shared/map-modal/map-modal.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  private placeSub: Subscription;
  isLoading = false;

  constructor(
      private navCtrl: NavController,
      private route: ActivatedRoute,
      private placesService: PlacesService,
      private modalCtrl: ModalController,
      private actionSheetCtrl: ActionSheetController,
      private bookingService: BookingsService,
      private loaderCtrl: LoadingController,
      private authService: AuthService,
      private alertCtrl: AlertController,
      private router: Router
    ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paraM => {
      if (!paraM.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId.pipe(take(1), switchMap(userId => {
        if (!userId) {
          throw new Error('Found no user..!');
        }
        fetchedUserId = userId;
        return this.placesService.getPlace(paraM.get('placeId'));
      }))
      .subscribe(pl => {
        this.place = pl;
        this.isBookable = pl.userId !== fetchedUserId;
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: 'An error ocurred..!',
          message: 'Could not load the place.',
          buttons: [{text: 'Okay', handler: () => {
            this.router.navigate(['/places/tabs/discover']);
          }}]
        }).then(alertEl => {
          alertEl.present();
        });
      });
    });
  }

  onBookPlace() {
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');

          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });

  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode },
      id: 'modal1'
    })
    .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
    })
    .then(resultData => {
      console.log(resultData.data, resultData.role);
      if (resultData.role === 'confirm') {
        this.loaderCtrl.create({
          message: 'Adding Booking...'
        }).then(loadingEl => {
          loadingEl.present();
          const data = resultData.data.bookingData;
          this.bookingService.addBooking(this.place.id, this.place.title, this.place.imageUrl,
            data.firstName, data.lastName, data.guestNumber, data.startDate, data.endDate)
            .subscribe(() => {
              loadingEl.dismiss();
            });
        });
      }
    });
  }

  onShowFullMap() {
    this.modalCtrl.create({component: MapModalComponent, componentProps: {
      center: {
        lat: this.place.location.lat,
        lng: this.place.location.lng
      },
      selectable: false,
      closeButtonText: 'Close',
      title: this.place.location.address
    }

    }).then(modalEl => {
      modalEl.present();
    });
  }

  ngOnDestroy(): void {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}

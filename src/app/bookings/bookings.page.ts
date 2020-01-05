import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { BookingsService } from './booking.service';
import { Booking } from './booking.model';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  private bookSub: Subscription;

  constructor(private bookingService: BookingsService,
              private loaderCtrl: LoadingController) { }

  ngOnInit() {
    this.bookSub = this.bookingService.booking.subscribe(book => {
      this.loadedBookings = book;
    });
  }

  onCancelBooking(bookingId: string, slidingEl: IonItemSliding)  {
    slidingEl.close();
    this.loaderCtrl.create({message: 'Cancelling...'}).then(loaderEl => {
      this.bookingService.cancelBooking(bookingId).subscribe(() => {
        loaderEl.dismiss();
      });
    });
  }

  ngOnDestroy(): void {
    if (this.bookSub) {
      this.bookSub.unsubscribe();
    }
  }

}

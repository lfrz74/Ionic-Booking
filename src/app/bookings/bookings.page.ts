import { Component, OnInit } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';

import { BookingsService } from './booking.service';
import { Booking } from './booking.model';


@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {
  loadedBookings: Booking[];

  constructor(private bookinsService: BookingsService) { }

  ngOnInit() {
    this.loadedBookings = this.bookinsService.booking;
  }

  onCancelBooking(bookId: number, slidingEl: IonItemSliding)  {
    slidingEl.close();
    // cancel booking with id offedId
  }

}

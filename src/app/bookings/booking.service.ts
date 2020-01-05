import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, delay, tap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root'  })
export class BookingsService {
    // tslint:disable-next-line: variable-name
    private _bookings = new BehaviorSubject<Booking[]>([]);

    constructor(private authService: AuthService) {
    }
    get booking() {
        return this._bookings.asObservable();
    }

    getBooking(id: string) {
        return this.booking.pipe(take(1),
          map(book => {
            return {...book.find(b => b.id === id )};
          }));
    }

    addBooking(placeId: string, placeTitle: string, placeImage: string,
               firstName: string, lastName: string, guestNumber: number,
               dateFrom: Date, dateTo: Date) {
        const newBooking = new Booking(Math.random().toString(), placeId, this.authService.userId,
            placeTitle, placeImage, firstName, lastName, guestNumber,
            dateFrom, dateTo);
        return this.booking.pipe(take(1), delay(1500), tap(book => {
            this._bookings.next(book.concat(newBooking));
        }));
    }

    cancelBooking(bookingId: string) {
        return this.booking.pipe(take(1), delay(1500), tap(book => {
            this._bookings.next(book.filter(b => b.id !== bookingId));
        }));
    }
}

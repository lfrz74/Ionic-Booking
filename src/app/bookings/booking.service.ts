import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, delay, tap, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface BookingData {
    bookedFrom: string;
    bookedTo: string;
    firstName: string;
    guestNumber: number;
    lastName: string;
    placeId: string;
    placeImage: string;
    placeTitle: string;
    userId: string;
}

@Injectable({ providedIn: 'root'  })
export class BookingsService {
    // tslint:disable-next-line: variable-name
    private _bookings = new BehaviorSubject<Booking[]>([]);

    constructor(
        private authService: AuthService,
        private httpClient: HttpClient) {
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
        let generatedId: string;
        const newBooking = new Booking(Math.random().toString(), placeId, this.authService.userId,
            placeTitle, placeImage, firstName, lastName, guestNumber,
            dateFrom, dateTo);
        return this.httpClient.post<{name: string}>(
            'https://ionic-booking-api.firebaseio.com/bookings.json',
            {...newBooking, id: null}
        ).pipe(switchMap(resData => {
            generatedId = resData.name;
            return this.booking;
        }),
        take(1),
        tap(book => {
            newBooking.id = generatedId;
            this._bookings.next(book.concat(newBooking));
        }));
    }

    cancelBooking(bookingId: string) {
        return this.httpClient.delete(`https://ionic-booking-api.firebaseio.com/bookings/${bookingId}.json`)
            .pipe(switchMap(() => {
                return this.booking;
            }),
            take(1),
            tap(book => {
                this._bookings.next(book.filter(b => b.id !== bookingId));
        }));
    }

    fetchBookings() {
        return this.httpClient.get<{[key: string]: BookingData}>(
            `https://ionic-booking-api.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${this.authService.userId
            }"`
        ).pipe(
            map(bookingData => {
                const bookings = [];
                for (const key in bookingData) {
                    if (bookingData.hasOwnProperty(key)) {
                        bookings.push(new Booking(key, bookingData[key].placeId, bookingData[key].userId,
                            bookingData[key].placeTitle, bookingData[key].placeImage, bookingData[key].firstName,
                            bookingData[key].lastName, bookingData[key].guestNumber, new Date(bookingData[key].bookedFrom),
                            new Date(bookingData[key].bookedTo)));
                    }
                }
                return bookings;
            }),
            tap(book => {
                this._bookings.next(book);
            })
        );
    }
}

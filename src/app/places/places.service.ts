import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, map } from 'rxjs/operators';

import { Place } from './places.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Mansión de Chisinche',
      'In the heart of Chalupas..!',
      'https://i.ytimg.com/vi/S9kkLOmuDgs/hqdefault.jpg',
      250.36,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
      ),
    new Place(
      'p2',
      'L\'Mansión de Ozogoche',
      'In the heart of Culinche..!',
      'https://megaricos.com/wp-content/uploads/2018/01/casa_venta_Miami_Beach_Florida_12.jpg',
      299.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
      ),
    new Place(
      'p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://i.pinimg.com/originals/9c/88/44/9c8844b217bdb6c17db14f51ad2e51a5.jpg',
      189.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
      )
  ]
);
  constructor(private authService: AuthService) { }

  get places() {
    return this._places.asObservable();
  }

  getPlace(id: string) {
    return this.places.pipe(take(1),
      map(pl => {
        return {...pl.find(p => p.id === id )};
      }));
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://mansionesmiami.com/wp-content/uploads/2019/09/casa-de-lujo.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    this.places.pipe(take(1)).subscribe((pl) => {
      this._places.next(pl.concat(newPlace));
    });

  }
}

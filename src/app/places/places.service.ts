import { Injectable } from '@angular/core';
import { Place } from './places.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places: Place[] = [
    new Place(
      'p1',
      'Mansión de Chisinche',
      'In the heart of Chalupas..!',
      'https://i.ytimg.com/vi/S9kkLOmuDgs/hqdefault.jpg',
      250.36 ),
    new Place(
      'p2',
      'L\'Mansión de Ozogoche',
      'In the heart of Culinche..!',
      'https://megaricos.com/wp-content/uploads/2018/01/casa_venta_Miami_Beach_Florida_12.jpg',
      299.99 ),
    new Place(
      'p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://i.pinimg.com/originals/9c/88/44/9c8844b217bdb6c17db14f51ad2e51a5.jpg',
      189.99 )
  ];

  constructor() { }

  get places() {
    return [...this._places];
  }
}

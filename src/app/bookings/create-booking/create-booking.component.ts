import { Component, OnInit, Input } from '@angular/core';
import { Place } from '../../places/places.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place;
  @Input() selectedMode: 'Select' | 'random';
  startDate: string;
  endDate: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availableTo);
    if (this.selectedMode === 'random') {
      // this.startDate = availableFrom.getTime() + Math.random() * (availableTo.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  onCancel() {
    this.modalCtrl.dismiss('modal1', 'cancel');
  }

  onBookPlace() {
    this.modalCtrl.dismiss({message: 'This is a dummy message!'}, 'confirm');
  }

}

import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {
  place: Place;

  constructor(
      private navCtrl: NavController,
      private route: ActivatedRoute,
      private placesService: PlacesService
    ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paraM => {
      if (!paraM.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.place = this.placesService.getPlace(paraM.get('placeId'));
    });
  }

  onBookPlace() {
    this.navCtrl.navigateBack('/places/tabs/discover');
  }
}

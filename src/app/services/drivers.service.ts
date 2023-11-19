import { Injectable } from '@angular/core';
import * as driversData from '../../assets/drivers.json';

export interface Driver {
  id: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root',
})
export class DriversService {
  drivers: Driver[] = Array<Driver>();

  constructor() {
    this.drivers = (driversData as any).default;
  }

  getAll() {
    return this.drivers;
  }
}

import { Injectable } from '@angular/core';
import  * as vehiclesData  from '../../assets/vehicles.json';

export interface Vehicle {
  id: number;
  plate: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {

  vehicles: Vehicle[] = Array<Vehicle>();
  constructor() {
    this.vehicles = (vehiclesData as any).default;
  }

  getAll() {
    return this.vehicles;
  }
}

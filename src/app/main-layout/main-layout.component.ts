import { Component, ViewChild } from '@angular/core';
import { Vehicle, VehiclesService } from '../services/vehicles.service';
import { Driver, DriversService } from '../services/drivers.service';
import { Record, RecordsService } from '../services/records.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  records: Record[] = [];
  filteredVehicles: Vehicle[] = [];

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  displayedColumns: string[] = [
    'serialNumber',
    'fullName',
    'issueDate',
    'isApproved',
    'tierAmount',
    'registrationAmount',
    'consumptionAmount',
    'rewardAmount',
  ];

  dataSource?: MatTableDataSource<Record>;
  selectedVehicle?: Vehicle;
  selectedDriverId?: number;

  constructor(
    private vehiclesService: VehiclesService,
    private driversService: DriversService,
    private recordsService: RecordsService
  ) {}

  ngOnInit() {
    this.vehicles = this.vehiclesService.getAll();
    this.drivers = this.driversService.getAll();
    this.records = this.recordsService.getAll();
    this.filteredVehicles = this.vehicles;
    this.dataSource = new MatTableDataSource<Record>();
  }

  ngAfterViewInit() {
    if (!this.dataSource) {
      console.log("dataSource not initialized after view init");
      return;
    }
    if (!this.paginator) {
      console.log("paginator not initialized after view init");
      return;
    }
    this.dataSource.paginator = this.paginator;
  }

  onVehicleClicked(id: number) {
    this.selectedVehicle = this.vehicles.find((vehicle) => id === vehicle.id);
    this.dataSource!.data = this.records.filter(
      (record) => record.plate === this.selectedVehicle?.plate
    );
  }

  filterVehicles(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filteredVehicles = this.vehicles.filter((vehicle) =>
      vehicle.plate.includes(filterValue)
    );
  }
}

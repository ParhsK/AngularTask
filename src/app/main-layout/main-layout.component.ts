import { Component, ViewChild } from '@angular/core';
import { Vehicle, VehiclesService } from '../services/vehicles.service';
import { Driver, DriversService } from '../services/drivers.service';
import { Record, RecordsService } from '../services/records.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';

enum StateOption {
  Approved,
  Declined,
  All,
}
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  StateOption = StateOption;
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  records: Record[] = [];
  filteredVehicles: Vehicle[] = [];
  selectedSerialNumber?: string;
  selectedState?: StateOption;
  selectedStartDate?: string;
  selectedEndDate?: string;
  selectedDriverId?: number;
  selectedVehicle?: Vehicle;
  dataSource?: MatTableDataSource<Record>;

  recordSearchForm = new FormGroup({
    selectedSerialNumber: new FormControl(''),
    selectedDriverId: new FormControl(),
    selectedStartDate: new FormControl<Date | null>(null),
    selectedEndDate: new FormControl<Date | null>(null),
    selectedState: new FormControl<StateOption>(StateOption.All),
  });

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
      console.log('dataSource not initialized after view init');
      return;
    }
    if (!this.paginator) {
      console.log('paginator not initialized after view init');
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

  reformIsApproved(isApproved: boolean) {
    if (isApproved === !true) {
      return 'Ακυρωμένο';
    }
    return 'Εγκεκριμένο'
  }

  reformDate(date: string) {
    return date = date.slice(6, 8) + '/' + date.slice(4, 6) + '/' + date.slice(0, 4);
  }

  onSearchClicked() {
    console.log('search clicked!', this.recordSearchForm.value);
    this.dataSource!.data = this.records
      .filter((record) => record.plate === this.selectedVehicle?.plate)
      .filter((record) => {
        if (this.recordSearchForm.value.selectedSerialNumber === '') {
          return true;
        }
        return (
          this.recordSearchForm.value.selectedSerialNumber ===
          record.serialNumber
        );
      })
      .filter((record) => {
        if (this.recordSearchForm.value.selectedDriverId === null) {
          return true;
        }
        return (
          this.recordSearchForm.value.selectedDriverId ===
          record.driverId.toString()
        ); //driver.id is string but record.driverid is number
      })
      .filter((record) => {
        const startDate = this.recordSearchForm.value.selectedStartDate;
        if (startDate === null) {
          return true;
        }
        const startYear = startDate?.getFullYear().toString();
        const startMonth = (startDate!.getMonth() + 1).toString().padStart(2, '0');
        const startDay = startDate!.getDate().toString().padStart(2, '0');
        const startingDate = startYear + startMonth + startDay;
        return record.issueDate >= startingDate;
      })
      .filter((record) => {
        const endDate = this.recordSearchForm.value.selectedEndDate;
        if (endDate === null) {
          return true;
        }
        const endYear = endDate?.getFullYear().toString();
        const endMonth = (endDate!.getMonth() + 1).toString().padStart(2, '0');
        const endDay = endDate!.getDate().toString().padStart(2, '0');
        const endingDate = endYear + endMonth + endDay;
        return record.issueDate <= endingDate;
      })
      .filter((record) => {
        switch (this.recordSearchForm.value.selectedState) {
          case StateOption.All:
            return true;
          case StateOption.Approved:
            return record.isApproved;
          case StateOption.Declined:
            return !record.isApproved;
          default:
            return true;
        }
      });
  }
}

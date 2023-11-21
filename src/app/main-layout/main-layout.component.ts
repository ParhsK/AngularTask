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
  defaultRecordSearchFormValues: any;

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
    this.defaultRecordSearchFormValues = this.recordSearchForm.value;
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
    this.resetFilters();
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

  stringToDate(date: string):Date {
    const year = Number(date.slice(0, 4));
    const month = Number(date.slice(4, 6));
    const day = Number(date.slice(6, 8));
    return new Date(year, month, day);
  }

  resetFilters() {
      this.recordSearchForm.reset(this.defaultRecordSearchFormValues);
  }

  onSearchClicked() {
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
        if (startDate === null || startDate === undefined) {
          return true;
        }
        return this.stringToDate(record.issueDate) >= startDate;
      })
      .filter((record) => {
        const endDate = this.recordSearchForm.value.selectedEndDate;
        if (endDate === null || endDate === undefined) {
          return true;
        }
        return this.stringToDate(record.issueDate) <= endDate;
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

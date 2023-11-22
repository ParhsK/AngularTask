import { Component, ViewChild } from '@angular/core';
import { Vehicle, VehiclesService } from '../services/vehicles.service';
import { Driver, DriversService } from '../services/drivers.service';
import { Record, RecordsService } from '../services/records.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

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
  dataSource?: MatTableDataSource<Record>;
  defaultRecordSearchFormValues: any;
  selectedVehiclePlate: string | null = '';

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
    private recordsService: RecordsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.vehicles = this.vehiclesService.getAll();
    this.drivers = this.driversService.getAll();
    this.records = this.recordsService.getAll();
    this.filteredVehicles = this.vehicles;
    this.dataSource = new MatTableDataSource<Record>();
    this.defaultRecordSearchFormValues = this.recordSearchForm.value;
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.selectedVehiclePlate = params.get('id');
      this.loadVehicleData(this.selectedVehiclePlate);
    });
  }

  ngAfterViewInit() {
    if (!this.dataSource) {
      console.warn('dataSource not initialized after view init');
      return;
    }
    if (!this.paginator) {
      console.warn('paginator not initialized after view init');
      return;
    }
    this.dataSource.paginator = this.paginator;
  }

  loadVehicleData(plate: string | null) {
    this.resetFilters();
    if ( !this.dataSource ) {
      console.warn("dataSource not initialized when loading vehicle data");
      return;
    }
    if ( plate === null ) {
      this.dataSource!.data = this.records;
      return;
    }
    this.dataSource!.data = this.records.filter(
      (record) => record.plate === plate
    );
  }

  filterVehicles(event: KeyboardEvent): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filteredVehicles = this.vehicles.filter((vehicle) =>
      vehicle.plate.includes(filterValue)
    );
  }

  reformIsApproved(isApproved: boolean): string {
    if (isApproved === !true) {
      return 'Ακυρωμένο';
    }
    return 'Εγκεκριμένο';
  }

  stringToDate(date: string): Date {
    const year = Number(date.slice(0, 4));
    const month = Number(date.slice(4, 6));
    const day = Number(date.slice(6, 8));
    return new Date(year, month, day);
  }

  resetFilters(): void {
    this.recordSearchForm.reset(this.defaultRecordSearchFormValues);
  }

  onSearchClicked(): void {
    this.dataSource!.data = this.records
      .filter((record) => {
        if ( this.selectedVehiclePlate) {
          return record.plate === this.selectedVehiclePlate;
        }
        return true;
      })
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

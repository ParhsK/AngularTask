import { Injectable } from '@angular/core';
import * as recordsData from '../../assets/records.json';

export interface Record {
  serialNumber: string,
  fullName: string,
  driverId: number,
  plate: string,
  issueDate: string,
  isApproved: boolean,
  tierAmount: number,
  registrationAmount: number,
  consumptionAmount: number,
  rewardAmount: number
}

@Injectable({
  providedIn: 'root'
})
export class RecordsService {

  records: Record[] = Array<Record>();

  constructor() {
    this.records = (recordsData as any).default;
  }

  getAll() {
    return this.records;
  }
}

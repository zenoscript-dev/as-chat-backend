import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

import * as moment from 'moment-timezone';

export class Base {
  @Column({ nullable: false, default: 'platform' })
  createdBy: string;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @Column({ nullable: false, default: 'platform' })
  updatedBy: string;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;

  createdUser: any;

  modifiedUser: any;

  @BeforeInsert()
  insertCreated() {
    this.createdAt = new Date(
      moment().tz('Asia/Kolkata').utc().format('YYYY-MM-DD HH:mm:ss'),
    );
    this.updatedAt = new Date(
      moment().tz('Asia/Kolkata').utc().format('YYYY-MM-DD HH:mm:ss'),
    );
  }

  @BeforeUpdate()
  insertUpdated() {
    if (!this.createdBy) {
      this.createdBy = this.getCreatedBy();
    }
    this.updatedAt = new Date(
      moment().tz('Asia/Kolkata').utc().format('YYYY-MM-DD HH:mm:ss'),
    );
  }

  getCreatedBy() {
    // If settings allow ID to be specified on create, use the specified ID
    return this.createdBy;
  }
}

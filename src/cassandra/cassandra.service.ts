import { Injectable, OnModuleInit } from '@nestjs/common';
import { CassandraConfigService } from '../core/config/cassandra.config';

@Injectable()
export class CassandraService implements OnModuleInit {
  constructor(
    private readonly cassandraConfigService: CassandraConfigService,
  ) {}

  async onModuleInit() {
    const client = this.cassandraConfigService.getClient();
    // Perform any required setup or queries
  }

  // Other service methods...
}

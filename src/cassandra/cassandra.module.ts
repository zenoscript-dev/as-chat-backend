import { Module } from '@nestjs/common';
import { CassandraService } from './cassandra.service';
import { CassandraConfigService } from '../core/config/cassandra.config';

@Module({
  controllers: [],
  providers: [CassandraService, CassandraConfigService],
})
export class CassandraModule {}

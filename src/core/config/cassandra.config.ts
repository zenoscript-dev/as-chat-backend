import { Injectable } from '@nestjs/common';
import { Client } from 'cassandra-driver';

@Injectable()
export class CassandraConfigService {
  private client: Client;

  constructor() {
    this.client = new Client({
      contactPoints: ['127.0.0.1'],
      localDataCenter: 'datacenter1',
      keyspace: 'chats',
    });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('Connected to Cassandra');
    } catch (error) {
      console.error('Failed to connect to Cassandra', error);
    }
  }

  getClient(): Client {
    return this.client;
  }
}

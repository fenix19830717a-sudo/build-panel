import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseConfig, ConnectionStatus, DatabaseType } from '../common/entities/database-config.entity';
import { CreateDatabaseDto, UpdateDatabaseDto, TestConnectionDto } from '../common/dto/database.dto';
import * as pg from 'pg';
import * as mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(DatabaseConfig)
    private databaseRepository: Repository<DatabaseConfig>,
  ) {}

  async findAll(): Promise<DatabaseConfig[]> {
    return this.databaseRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DatabaseConfig> {
    const database = await this.databaseRepository.findOne({
      where: { id },
    });
    if (!database) {
      throw new NotFoundException(`Database with ID ${id} not found`);
    }
    return database;
  }

  async create(createDto: CreateDatabaseDto): Promise<DatabaseConfig> {
    const database = this.databaseRepository.create({
      ...createDto,
      connectionStatus: ConnectionStatus.DISCONNECTED,
    });
    return this.databaseRepository.save(database);
  }

  async update(id: string, updateDto: UpdateDatabaseDto): Promise<DatabaseConfig> {
    const database = await this.findOne(id);
    Object.assign(database, updateDto);
    return this.databaseRepository.save(database);
  }

  async remove(id: string): Promise<void> {
    const database = await this.findOne(id);
    await this.databaseRepository.remove(database);
  }

  async testConnection(testDto: TestConnectionDto): Promise<{ success: boolean; message: string }> {
    try {
      switch (testDto.type) {
        case DatabaseType.POSTGRESQL:
          return await this.testPostgresConnection(testDto);
        case DatabaseType.MYSQL:
          return await this.testMysqlConnection(testDto);
        case DatabaseType.MONGODB:
          return await this.testMongoConnection(testDto);
        default:
          return { success: false, message: 'Unsupported database type' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  private async testPostgresConnection(testDto: TestConnectionDto): Promise<{ success: boolean; message: string }> {
    const client = new pg.Client({
      host: testDto.host,
      port: testDto.port,
      database: testDto.database,
      user: testDto.username,
      password: testDto.password,
      ssl: testDto.sslEnabled ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
    });

    try {
      await client.connect();
      const result = await client.query('SELECT version()');
      await client.end();
      return { 
        success: true, 
        message: `Connected to PostgreSQL: ${result.rows[0].version}` 
      };
    } catch (error) {
      throw new Error(`PostgreSQL connection failed: ${error.message}`);
    }
  }

  private async testMysqlConnection(testDto: TestConnectionDto): Promise<{ success: boolean; message: string }> {
    const connection = await mysql.createConnection({
      host: testDto.host,
      port: testDto.port,
      database: testDto.database,
      user: testDto.username,
      password: testDto.password,
      ssl: testDto.sslEnabled ? {} : undefined,
      connectTimeout: 10000,
    });

    try {
      const [rows] = await connection.execute('SELECT VERSION() as version');
      await connection.end();
      return { 
        success: true, 
        message: `Connected to MySQL: ${rows[0].version}` 
      };
    } catch (error) {
      throw new Error(`MySQL connection failed: ${error.message}`);
    }
  }

  private async testMongoConnection(testDto: TestConnectionDto): Promise<{ success: boolean; message: string }> {
    const uri = `mongodb://${testDto.username}:${testDto.password}@${testDto.host}:${testDto.port}/${testDto.database}`;
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    try {
      await client.connect();
      const adminDb = client.db('admin');
      const result = await adminDb.command({ buildInfo: 1 });
      await client.close();
      return { 
        success: true, 
        message: `Connected to MongoDB: ${result.version}` 
      };
    } catch (error) {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
  }

  async updateConnectionStatus(
    id: string, 
    status: ConnectionStatus, 
    error?: string
  ): Promise<void> {
    await this.databaseRepository.update(id, {
      connectionStatus: status,
      connectionError: error,
      lastConnectedAt: status === ConnectionStatus.CONNECTED ? new Date() : undefined,
    });
  }
}

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class InitialSchema1712345678901 implements MigrationInterface {
  name = 'InitialSchema1712345678901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'email', type: 'varchar', length: '255', isUnique: true },
          { name: 'password_hash', type: 'varchar', length: '255' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'role', type: 'varchar', length: '20', default: "'user'" },
          { name: 'status', type: 'varchar', length: '20', default: "'active'" },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // API Keys table
    await queryRunner.createTable(
      new Table({
        name: 'api_keys',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'key_hash', type: 'varchar', length: '255' },
          { name: 'provider', type: 'varchar', length: '50' },
          { name: 'quota', type: 'integer', default: 1000000 },
          { name: 'used', type: 'integer', default: 0 },
          { name: 'expires_at', type: 'timestamp', isNullable: true },
          { name: 'status', type: 'varchar', length: '20', default: "'active'" },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'api_keys',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Servers table
    await queryRunner.createTable(
      new Table({
        name: 'servers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'host', type: 'varchar', length: '255' },
          { name: 'port', type: 'integer', default: 22 },
          { name: 'username', type: 'varchar', length: '50', default: "'root'" },
          { name: 'ssh_key', type: 'text', isNullable: true },
          { name: 'agent_token', type: 'varchar', length: '255', isUnique: true, isNullable: true },
          { name: 'status', type: 'varchar', length: '20', default: "'offline'" },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'servers',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Apps table
    await queryRunner.createTable(
      new Table({
        name: 'apps',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'version', type: 'varchar', length: '50' },
          { name: 'image', type: 'varchar', length: '255' },
          { name: 'config_schema', type: 'jsonb', default: "'{}'" },
          { name: 'default_config', type: 'jsonb', default: "'{}'" },
          { name: 'author_id', type: 'uuid', isNullable: true },
          { name: 'status', type: 'varchar', length: '20', default: "'draft'" },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // ServerApps table
    await queryRunner.createTable(
      new Table({
        name: 'server_apps',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'server_id', type: 'uuid' },
          { name: 'app_id', type: 'uuid' },
          { name: 'container_id', type: 'varchar', length: '100', isNullable: true },
          { name: 'config', type: 'jsonb', default: "'{}'" },
          { name: 'status', type: 'varchar', length: '20', default: "'stopped'" },
          { name: 'port_mappings', type: 'jsonb', default: "'[]'" },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'server_apps',
      new TableForeignKey({
        columnNames: ['server_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'servers',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'server_apps',
      new TableForeignKey({
        columnNames: ['app_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'apps',
        onDelete: 'CASCADE',
      }),
    );

    // Tasks table
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'type', type: 'varchar', length: '50' },
          { name: 'target_type', type: 'varchar', length: '50' },
          { name: 'target_id', type: 'uuid' },
          { name: 'payload', type: 'jsonb', default: "'{}'" },
          { name: 'status', type: 'varchar', length: '20', default: "'pending'" },
          { name: 'result', type: 'jsonb', isNullable: true },
          { name: 'error', type: 'text', isNullable: true },
          { name: 'started_at', type: 'timestamp', isNullable: true },
          { name: 'completed_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // AuditLogs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'action', type: 'varchar', length: '100' },
          { name: 'target_type', type: 'varchar', length: '50' },
          { name: 'target_id', type: 'uuid', isNullable: true },
          { name: 'details', type: 'jsonb', default: "'{}'" },
          { name: 'ip_address', type: 'inet', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Create indexes
    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['email'] }));
    await queryRunner.createIndex('api_keys', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('servers', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('servers', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('server_apps', new TableIndex({ columnNames: ['server_id'] }));
    await queryRunner.createIndex('server_apps', new TableIndex({ columnNames: ['app_id'] }));
    await queryRunner.createIndex('tasks', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('tasks', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ columnNames: ['user_id'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ columnNames: ['created_at'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('tasks');
    await queryRunner.dropTable('server_apps');
    await queryRunner.dropTable('apps');
    await queryRunner.dropTable('servers');
    await queryRunner.dropTable('api_keys');
    await queryRunner.dropTable('users');
  }
}

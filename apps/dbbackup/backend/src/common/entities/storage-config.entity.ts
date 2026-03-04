import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StorageProvider {
  LOCAL = 'local',
  S3 = 's3',
  MINIO = 'minio',
  SFTP = 'sftp',
  GCS = 'gcs',
  AZURE = 'azure',
}

@Entity('storage_configs')
export class StorageConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: StorageProvider,
    default: StorageProvider.LOCAL,
  })
  provider: StorageProvider;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  // Local storage settings
  @Column({ type: 'text', nullable: true })
  localPath: string;

  // S3/MinIO settings
  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  region: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bucket: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accessKeyId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secretAccessKey: string;

  @Column({ type: 'boolean', default: false })
  useSSL: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pathPrefix: string;

  // SFTP settings
  @Column({ type: 'varchar', length: 255, nullable: true })
  sftpHost: string;

  @Column({ type: 'int', nullable: true })
  sftpPort: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sftpUsername: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sftpPassword: string;

  @Column({ type: 'text', nullable: true })
  sftpPrivateKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sftpRemotePath: string;

  // Azure settings
  @Column({ type: 'varchar', length: 255, nullable: true })
  azureAccountName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  azureAccountKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  azureContainer: string;

  // GCS settings
  @Column({ type: 'text', nullable: true })
  gcsKeyFile: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gcsBucket: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gcsProjectId: string;

  // Retention settings
  @Column({ type: 'int', default: 0 })
  maxStorageSize: number;

  @Column({ type: 'int', default: 0 })
  maxBackupCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

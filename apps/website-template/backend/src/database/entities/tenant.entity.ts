import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DEPLOYING = 'deploying',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  domain: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  subdomain: string;

  @Column({ type: 'uuid', nullable: true })
  theme_id: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
  })
  status: TenantStatus;

  @Column({ type: 'jsonb', nullable: true })
  deploy_config: {
    server_ip?: string;
    ssl_enabled?: boolean;
    custom_domain?: string;
  };

  @Column({ type: 'varchar', length: 50, nullable: true })
  plan: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

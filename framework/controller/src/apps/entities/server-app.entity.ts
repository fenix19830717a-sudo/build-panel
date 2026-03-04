import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Server } from '../../servers/entities/server.entity';
import { App } from './app.entity';

export enum ServerAppStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error',
  PENDING = 'pending',
}

@Entity('server_apps')
export class ServerApp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'server_id' })
  serverId: string;

  @ManyToOne(() => Server)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @Column({ name: 'app_id' })
  appId: string;

  @ManyToOne(() => App)
  @JoinColumn({ name: 'app_id' })
  app: App;

  @Column({ name: 'container_id', nullable: true })
  containerId: string;

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ServerAppStatus,
    default: ServerAppStatus.STOPPED,
  })
  status: ServerAppStatus;

  @Column({ name: 'port_mappings', type: 'jsonb', default: [] })
  portMappings: Array<{ host: number; container: number }>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ServerStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
}

@Entity('servers')
export class Server {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column()
  host: string;

  @Column({ default: 22 })
  port: number;

  @Column({ default: 'root' })
  username: string;

  @Column({ name: 'ssh_key', type: 'text', nullable: true })
  sshKey: string;

  @Column({ nullable: true })
  os: string;

  @Column({ nullable: true })
  arch: string;

  @Column({ name: 'agent_token', nullable: true, unique: true })
  agentToken: string;

  @Column({
    type: 'enum',
    enum: ServerStatus,
    default: ServerStatus.OFFLINE,
  })
  status: ServerStatus;

  @Column({ name: 'last_heartbeat', nullable: true })
  lastHeartbeat: Date;

  @Column({ name: 'cpu_cores', nullable: true })
  cpuCores: number;

  @Column({ name: 'memory_gb', nullable: true })
  memoryGb: number;

  @Column({ name: 'disk_gb', nullable: true })
  diskGb: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

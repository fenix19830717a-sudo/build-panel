import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AppStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  DEPRECATED = 'deprecated',
}

@Entity('apps')
export class App {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  version: string;

  @Column()
  image: string;

  @Column({ name: 'config_schema', type: 'jsonb', default: {} })
  configSchema: Record<string, any>;

  @Column({ name: 'default_config', type: 'jsonb', default: {} })
  defaultConfig: Record<string, any>;

  @Column({ name: 'author_id', nullable: true })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({
    type: 'enum',
    enum: AppStatus,
    default: AppStatus.DRAFT,
  })
  status: AppStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

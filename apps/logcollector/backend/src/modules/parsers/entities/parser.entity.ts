import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ParserType {
  JSON = 'json',
  REGEX = 'regex',
  GROK = 'grok',
  CSV = 'csv',
  SYSLOG = 'syslog',
}

@Entity('parsers')
export class Parser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ParserType })
  type: ParserType;

  @Column({ type: 'text' })
  pattern: string;

  @Column({ type: 'simple-json', nullable: true })
  fields: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required?: boolean;
  }>;

  @Column({ type: 'uuid', nullable: true })
  sourceId: string;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

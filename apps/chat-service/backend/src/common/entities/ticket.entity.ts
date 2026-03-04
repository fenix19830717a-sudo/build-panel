import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_number', type: 'varchar', length: 50, unique: true })
  ticketNumber: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'visitor_id', type: 'varchar', length: 100 })
  visitorId: string;

  @Column({ name: 'visitor_email', type: 'varchar', length: 255, nullable: true })
  visitorEmail: string;

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  sessionId: string;

  @Column({ type: 'varchar', length: 50, default: 'open' })
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

  @Column({ type: 'varchar', length: 50, default: 'medium' })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

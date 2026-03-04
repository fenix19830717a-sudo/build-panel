import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'visitor_id', type: 'varchar', length: 100 })
  visitorId: string;

  @Column({ name: 'visitor_name', type: 'varchar', length: 100, nullable: true })
  visitorName: string;

  @Column({ name: 'visitor_email', type: 'varchar', length: 255, nullable: true })
  visitorEmail: string;

  @Column({ name: 'agent_id', type: 'uuid', nullable: true })
  agentId: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: 'active' | 'waiting' | 'closed' | 'transferred';

  @Column({ name: 'source_url', type: 'varchar', length: 500, nullable: true })
  sourceUrl: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ChatMessage, message => message.session)
  messages: ChatMessage[];
}

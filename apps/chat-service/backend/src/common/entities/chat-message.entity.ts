import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatSession } from './chat-session.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => ChatSession, session => session.messages)
  @JoinColumn({ name: 'session_id' })
  session: ChatSession;

  @Column({ name: 'sender_type', type: 'varchar', length: 20 })
  senderType: 'visitor' | 'agent' | 'system' | 'bot';

  @Column({ name: 'sender_id', type: 'varchar', length: 100, nullable: true })
  senderId: string;

  @Column({ name: 'sender_name', type: 'varchar', length: 100, nullable: true })
  senderName: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'message_type', type: 'varchar', length: 50, default: 'text' })
  messageType: 'text' | 'image' | 'file' | 'quick_reply' | 'system';

  @Column({ name: 'file_url', type: 'varchar', length: 500, nullable: true })
  fileUrl: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

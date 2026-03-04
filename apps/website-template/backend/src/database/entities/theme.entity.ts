import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('themes')
export class Theme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  preview_image: string;

  @Column({ type: 'jsonb', default: {} })
  config: {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
      accent?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
    };
    layout?: {
      maxWidth?: string;
      header?: string;
      footer?: string;
    };
    components?: {
      button?: string;
      card?: string;
      image?: string;
    };
  };

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 50, default: 'default' })
  category: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

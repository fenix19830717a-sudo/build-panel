import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PageStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  blocks: any[];

  @Column({
    type: 'enum',
    enum: PageStatus,
    default: PageStatus.DRAFT,
  })
  status: PageStatus;

  @Column({ type: 'boolean', default: false })
  is_homepage: boolean;

  @Column({ type: 'boolean', default: true })
  show_in_nav: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nav_label: string;

  @Column({ type: 'int', default: 0 })
  nav_order: number;

  @Column({ type: 'jsonb', nullable: true })
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    og_image?: string;
  };

  @Column({ type: 'text', nullable: true })
  custom_css: string;

  @Column({ type: 'text', nullable: true })
  custom_js: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

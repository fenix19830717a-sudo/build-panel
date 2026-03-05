import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum ContentType {
  HERO = 'hero',
  FEATURES = 'features',
  ABOUT = 'about',
  SERVICES = 'services',
  TESTIMONIALS = 'testimonials',
  TEAM = 'team',
  FAQ = 'faq',
  CTA = 'cta',
  FOOTER = 'footer',
  CUSTOM = 'custom',
}

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'enum', enum: ContentType })
  type: ContentType;

  @Column({ type: 'enum', enum: ContentStatus, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ type: 'simple-json' })
  data: {
    // Hero 类型
    headline?: string;
    subheadline?: string;
    description?: string;
    backgroundImage?: string;
    backgroundVideo?: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    
    // Features 类型
    features?: Array<{
      icon?: string;
      title: string;
      description: string;
    }>;
    
    // About 类型
    content?: string;
    image?: string;
    stats?: Array<{
      value: string;
      label: string;
    }>;
    
    // Services 类型
    services?: Array<{
      icon?: string;
      title: string;
      description: string;
      price?: string;
    }>;
    
    // Testimonials 类型
    testimonials?: Array<{
      name: string;
      role?: string;
      avatar?: string;
      content: string;
      rating?: number;
    }>;
    
    // Team 类型
    members?: Array<{
      name: string;
      role: string;
      avatar?: string;
      bio?: string;
      socialLinks?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
      };
    }>;
    
    // FAQ 类型
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
    
    // CTA 类型
    heading?: string;
    buttonText?: string;
    buttonLink?: string;
    
    // Footer 类型
    columns?: Array<{
      title: string;
      links: Array<{
        label: string;
        url: string;
      }>;
    }>;
    copyright?: string;
    
    // 通用
    metadata?: {
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string[];
    };
  };

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    order?: number;
    sectionId?: string;
    className?: string;
    customAttributes?: Record<string, string>;
  };

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => Tenant, (tenant) => tenant.contents)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

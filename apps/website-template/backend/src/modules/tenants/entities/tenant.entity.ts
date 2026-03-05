import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Content } from '../../contents/entities/content.entity';
import { Product } from '../../products/entities/product.entity';
import { Page } from '../../pages/entities/page.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum TenantPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  favicon: string;

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.ACTIVE })
  status: TenantStatus;

  @Column({ type: 'enum', enum: TenantPlan, default: TenantPlan.FREE })
  plan: TenantPlan;

  @Column({ type: 'simple-json', nullable: true })
  settings: {
    domain?: string;
    analyticsId?: string;
    customCss?: string;
    customJs?: string;
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
  };

  @Column({ type: 'simple-json', nullable: true })
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };

  @OneToMany(() => Content, (content) => content.tenant)
  contents: Content[];

  @OneToMany(() => Product, (product) => product.tenant)
  products: Product[];

  @OneToMany(() => Page, (page) => page.tenant)
  pages: Page[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

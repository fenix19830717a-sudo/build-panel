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

export enum ThemeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

@Entity('themes')
export class Theme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ThemeStatus, default: ThemeStatus.DRAFT })
  status: ThemeStatus;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ type: 'simple-json' })
  config: {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      surface?: string;
      text?: string;
      textMuted?: string;
      border?: string;
      accent?: string;
      success?: string;
      warning?: string;
      error?: string;
    };
    typography?: {
      fontFamily?: {
        heading?: string;
        body?: string;
      };
      fontSize?: {
        xs?: string;
        sm?: string;
        base?: string;
        lg?: string;
        xl?: string;
        '2xl'?: string;
        '3xl'?: string;
        '4xl'?: string;
      };
    };
    layout?: {
      maxWidth?: string;
      containerPadding?: string;
      gridGap?: string;
      borderRadius?: string;
      sidebarWidth?: string;
    };
    spacing?: {
      xs?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
    };
    shadows?: {
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
    };
    components?: {
      button?: {
        borderRadius?: string;
        padding?: string;
      };
      card?: {
        borderRadius?: string;
        padding?: string;
        shadow?: string;
      };
      input?: {
        borderRadius?: string;
        padding?: string;
      };
    };
  };

  @Column({ type: 'simple-json', nullable: true })
  customCss: string;

  @Column({ nullable: true })
  previewImage: string;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

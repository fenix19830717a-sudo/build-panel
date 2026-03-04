-- Migration: Initial Schema
-- Created: 2024-03-05

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    theme_id UUID,
    settings JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    deploy_config JSONB,
    plan VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Themes table
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    preview_image VARCHAR(255),
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    category VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contents table
CREATE TABLE contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    language VARCHAR(10) DEFAULT 'zh-CN',
    section VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, key, language)
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2),
    compare_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    sku VARCHAR(50),
    images JSONB DEFAULT '[]',
    category_id UUID,
    tag_ids JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft',
    seo JSONB,
    attributes JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Categories table
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID,
    sort_order INTEGER DEFAULT 0,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Tags table
CREATE TABLE product_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pages table
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    content TEXT,
    blocks JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft',
    is_homepage BOOLEAN DEFAULT false,
    show_in_nav BOOLEAN DEFAULT true,
    nav_label VARCHAR(50),
    nav_order INTEGER DEFAULT 0,
    seo JSONB,
    custom_css TEXT,
    custom_js TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, slug)
);

-- Media table
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    type VARCHAR(20) DEFAULT 'other',
    size BIGINT NOT NULL,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    width INTEGER,
    height INTEGER,
    alt_text VARCHAR(255),
    folder VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_status ON tenants(status);

CREATE INDEX idx_contents_tenant_id ON contents(tenant_id);
CREATE INDEX idx_contents_key ON contents(key);
CREATE INDEX idx_contents_language ON contents(language);

CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);

CREATE INDEX idx_categories_tenant_id ON product_categories(tenant_id);
CREATE INDEX idx_tags_tenant_id ON product_tags(tenant_id);

CREATE INDEX idx_pages_tenant_id ON pages(tenant_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);

CREATE INDEX idx_media_tenant_id ON media(tenant_id);
CREATE INDEX idx_media_folder ON media(folder);

-- Insert default themes
INSERT INTO themes (name, display_name, description, config, category) VALUES
('default', '默认主题', '简洁现代的默认主题', '{"colors":{"primary":"#1a1a1a","secondary":"#c9a962","background":"#ffffff","text":"#333333"}}', 'default'),
('elegant', '优雅主题', '适用于珠宝/奢侈品行业', '{"colors":{"primary":"#1a1a1a","secondary":"#c9a962","background":"#fafafa","text":"#333333","accent":"#d4af37"}}', 'luxury'),
('modern', '现代主题', '适用于科技/B2B行业', '{"colors":{"primary":"#0066cc","secondary":"#00a8e8","background":"#ffffff","text":"#1a1a1a"}}', 'tech'),
('minimal', '极简主题', '适用于设计/艺术行业', '{"colors":{"primary":"#000000","secondary":"#666666","background":"#ffffff","text":"#000000"}}', 'design'),
('luxury', '奢华主题', '适用于高端定制行业', '{"colors":{"primary":"#000000","secondary":"#d4af37","background":"#0a0a0a","text":"#ffffff","accent":"#d4af37"}}', 'luxury');

-- Create Row Level Security policies
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create policy function
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant', true), '')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for contents
CREATE POLICY tenant_contents_isolation ON contents
    USING (tenant_id = get_current_tenant_id());

-- Create policies for products
CREATE POLICY tenant_products_isolation ON products
    USING (tenant_id = get_current_tenant_id());

-- Create policies for categories
CREATE POLICY tenant_categories_isolation ON product_categories
    USING (tenant_id = get_current_tenant_id());

-- Create policies for tags
CREATE POLICY tenant_tags_isolation ON product_tags
    USING (tenant_id = get_current_tenant_id());

-- Create policies for pages
CREATE POLICY tenant_pages_isolation ON pages
    USING (tenant_id = get_current_tenant_id());

-- Create policies for media
CREATE POLICY tenant_media_isolation ON media
    USING (tenant_id = get_current_tenant_id());

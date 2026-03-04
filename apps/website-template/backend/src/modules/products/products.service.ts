import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../../database/entities/product.entity';
import { ProductCategory } from '../../database/entities/product-category.entity';
import { ProductTag } from '../../database/entities/product-tag.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>,
    @InjectRepository(ProductTag)
    private tagRepository: Repository<ProductTag>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      tenant_id: createProductDto.tenantId,
      name: createProductDto.name,
      description: createProductDto.description,
      short_description: createProductDto.short_description,
      price: createProductDto.price,
      compare_price: createProductDto.compare_price,
      stock: createProductDto.stock || 0,
      sku: createProductDto.sku,
      images: createProductDto.images || [],
      category_id: createProductDto.category_id,
      tag_ids: createProductDto.tag_ids || [],
      status: createProductDto.status || ProductStatus.DRAFT,
      seo: createProductDto.seo,
      attributes: createProductDto.attributes || {},
    });
    return this.productRepository.save(product);
  }

  async findAll(query: ProductQueryDto) {
    const { tenantId, page = 1, limit = 10, category, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenant_id: tenantId };
    if (category) {
      where.category_id = category;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, tenant_id: tenantId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    tenantId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id, tenantId);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const product = await this.findOne(id, tenantId);
    await this.productRepository.remove(product);
  }

  // Categories
  async findCategories(tenantId: string): Promise<ProductCategory[]> {
    return this.categoryRepository.find({
      where: { tenant_id: tenantId },
      order: { sort_order: 'ASC' },
    });
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    tenantId: string;
  }): Promise<ProductCategory> {
    const category = this.categoryRepository.create({
      tenant_id: data.tenantId,
      name: data.name,
      slug: data.slug,
      description: data.description,
    });
    return this.categoryRepository.save(category);
  }

  // Tags
  async findTags(tenantId: string): Promise<ProductTag[]> {
    return this.tagRepository.find({
      where: { tenant_id: tenantId },
      order: { name: 'ASC' },
    });
  }
}

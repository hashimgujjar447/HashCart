import { isArray } from 'util';
import { ValidationError } from '../../../../packages/error-handler';
import prisma from '../../../../packages/libs/prisma';

import { NextFunction, Request, Response } from 'express';
import imageKit from '../../../../packages/libs/imageKit';
import { Prisma } from '../../../../generated/prisma';

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({ message: 'Categories not found' });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

export const createDiscountCodes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    if (!public_name || !discountType || !discountValue || !discountCode) {
      return next(new ValidationError('All fields are required'));
    }

    const isDiscountCode = await prisma.discount_codes.findUnique({
      where: { discountCode },
    });

    if (isDiscountCode) {
      return next(
        new ValidationError(
          'Discount code already available please use a different code.',
        ),
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountCode,
        discountType,
        discountValue: parseFloat(discountValue),
        sellerId: req.seller?.id || '',
      },
    });

    return res.status(200).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiscountCodes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller?.id || '',
      },
    });

    res.status(200).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDiscountCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id || '';

    if (!id || isArray(id)) {
      return next(new ValidationError('Discount code ID is required'));
    }

    const findDiscountCode = await prisma.discount_codes.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!findDiscountCode) {
      return next(new ValidationError('Discount code not found'));
    }

    if (findDiscountCode.sellerId !== sellerId) {
      return next(
        new ValidationError(
          'You are not authorized to delete this discount code',
        ),
      );
    }

    await prisma.discount_codes['delete']({
      where: {
        id: id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Discount code deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName } = req.body;

    const response = await imageKit.upload({
      file: fileName,
      fileName: `Product-${Date.now()}.jpg`,
      folder: '/products',
    });

    res.status(200).json({
      success: true,
      fileId: response.fileId,
      file_url: response.url,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return next(new ValidationError('File ID is required'));
    }

    const response = await imageKit.deleteFile(fileId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      response,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      description,
      detailedDescription,
      tags,
      warranty,
      slug,
      brand,
      cashOnDelivery = 'yes',
      video_url,
      videoUrl,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      discountCode,
      stock,
      sale_price,
      salePrice,
      regular_price,
      regularPrice,
      subCategory,
      customProperties = {},
      images = [],
      specifications = [],
      status = 'Active',
    } = req.body;

    const actualSalePrice = sale_price ?? salePrice;
    const actualRegularPrice = regular_price ?? regularPrice;
    const actualVideoUrl = video_url ?? videoUrl;
    const actualDiscountCode = discountCodes ?? discountCode;

    if (status !== 'Draft') {
      if (
        !title ||
        !description ||
        !detailedDescription ||
        !tags ||
        !warranty ||
        !slug ||
        !category ||
        !subCategory ||
        actualSalePrice === undefined ||
        actualSalePrice === null ||
        actualSalePrice === '' ||
        stock === undefined ||
        stock === null ||
        stock === ''
      ) {
        return next(
          new ValidationError('All required fields must be provided'),
        );
      }
    } else {
      if (!title || !slug) {
        return next(
          new ValidationError('Title and slug are required to save draft'),
        );
      }
    }

    const isSlugExist = await prisma.products.findUnique({
      where: { slug },
    });

    if (isSlugExist) {
      return next(
        new ValidationError(
          'Product slug already exists. Please choose another slug!',
        ),
      );
    }

    const parsedSalePrice = actualSalePrice ? parseFloat(actualSalePrice) : 0;
    const parsedRegularPrice = actualRegularPrice
      ? parseFloat(actualRegularPrice)
      : null;
    const parsedStock = stock ? parseInt(stock, 10) : 0;

    const formattedDiscountCodes = Array.isArray(actualDiscountCode)
      ? (actualDiscountCode as string[])
      : actualDiscountCode
        ? [actualDiscountCode as string]
        : [];

    const formattedTags = Array.isArray(tags)
      ? (tags as string[])
      : typeof tags === 'string' && tags.trim() !== ''
        ? tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

    const productImages = Array.isArray(images)
      ? images
          .filter((img: any) => img && (img.fileUrl || img.url))
          .map((img: any) => ({
            file_id: img.fileId || img.file_id || '',
            url: img.fileUrl || img.url || '',
          }))
      : [];

    const product = await prisma.products.create({
      data: {
        title,
        description: description || '',
        detailedDescription: detailedDescription || '',
        tags: formattedTags,
        warranty: warranty || '',
        slug,
        brand: brand || null,
        cashOnDelivery: cashOnDelivery || 'yes',
        video_url: actualVideoUrl || null,
        category: category || '',
        subCategory: subCategory || '',
        colors: Array.isArray(colors) ? (colors as string[]) : [],
        sizes: Array.isArray(sizes) ? (sizes as string[]) : [],
        discountCodes: formattedDiscountCodes,
        stock: parsedStock,
        sale_price: parsedSalePrice,
        regular_price: parsedRegularPrice,
        customProperties: customProperties as any,
        images: {
          create: productImages,
        },
        specifications: Array.isArray(specifications)
          ? (specifications as any)
          : [],
        sellerId: req.seller?.id || '',
        shopId: req.seller?.shop?.id || null,
        status: status === 'Draft' ? 'Draft' : 'Active',
      },
      include: {
        images: true,
      },
    });

    return res.status(201).json({
      success: true,
      message:
        status === 'Draft'
          ? 'Product draft saved successfully'
          : 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { includeDeleted, deletedOnly } = req.query;

    let isDeletedFilter: any = false;
    if (deletedOnly === 'true') {
      isDeletedFilter = true;
    } else if (includeDeleted === 'true') {
      isDeletedFilter = undefined;
    }

    const whereClause: any = {
      sellerId: req.seller?.id || '',
    };

    if (isDeletedFilter !== undefined) {
      whereClause.isDeleted = isDeletedFilter;
    }

    const allProducts = await prisma.products.findMany({
      where: whereClause,
      include: {
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      products: allProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;
    const category = req.query.category as string;
    const subCategory = req.query.subCategory as string;
    const search = req.query.search as string;

    const baseFilter: Prisma.productsWhereInput = {
      isDeleted: false,
      status: 'Active',
      OR: [
        {
          starting_date: null,
        },
        {
          ending_date: null,
        },
      ],
    };

    if (category) {
      baseFilter.category = category;
    }

    if (subCategory) {
      baseFilter.subCategory = subCategory;
    }

    if (search) {
      baseFilter.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    let orderBy: Prisma.productsOrderByWithRelationInput = {
      totalSales: 'desc',
    };

    if (type === 'latest') {
      orderBy = { createdAt: 'desc' };
    } else if (type === 'topSales') {
      orderBy = { totalSales: 'desc' };
    } else if (type === 'priceLowToHigh') {
      orderBy = { sale_price: 'asc' };
    } else if (type === 'priceHighToLow') {
      orderBy = { sale_price: 'desc' };
    }

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        where: baseFilter,
        include: {
          images: true,
          shop: true,
        },
        orderBy,
      }),
      prisma.products.count({
        where: baseFilter,
      }),
      prisma.products.findMany({
        take: 10,
        where: {
          isDeleted: false,
          status: 'Active',
        },
        include: {
          images: true,
          shop: true,
        },
        orderBy: {
          totalSales: 'desc',
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      top10Products,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isArray(id)) {
      return next(new ValidationError('Product ID is required'));
    }

    const findProductForSeller = await prisma.products.findUnique({
      where: { id: id },
    });

    if (!findProductForSeller) {
      return next(new ValidationError('Product not found'));
    }

    if (findProductForSeller.sellerId !== req.seller?.id) {
      return next(
        new ValidationError('You are not authorized to delete this product'),
      );
    }

    await prisma.products.update({
      where: { id: id },
      data: {
        isDeleted: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product moved to trash. You can restore it within 24 hours.',
    });
  } catch (error) {
    next(error);
  }
};

export const restoreProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isArray(id)) {
      return next(new ValidationError('Product ID is required'));
    }

    const product = await prisma.products.findUnique({
      where: { id: id },
      include: { images: true },
    });

    if (!product) {
      return next(new ValidationError('Product not found'));
    }

    if (product.sellerId !== req.seller?.id) {
      return next(
        new ValidationError('You are not authorized to restore this product'),
      );
    }

    if (!product.isDeleted) {
      return next(new ValidationError('Product is not in trash'));
    }

    const now = new Date().getTime();
    const deletedTime = new Date(product.updatedAt).getTime();
    const hoursDifference = (now - deletedTime) / (1000 * 60 * 60);

    if (hoursDifference > 24) {
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.file_id) {
            try {
              await imageKit.deleteFile(img.file_id);
            } catch (e) {}
          }
        }
        await prisma.images.deleteMany({
          where: { productId: id },
        });
      }

      await prisma.products.delete({
        where: { id: id },
      });

      return next(
        new ValidationError(
          'Product restoration period of 24 hours has expired. The product has been permanently deleted.',
        ),
      );
    }

    const restoredProduct = await prisma.products.update({
      where: { id: id },
      data: {
        isDeleted: false,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product restored successfully',
      product: restoredProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isArray(id)) {
      return next(new ValidationError('Product ID is required'));
    }

    const product = await prisma.products.findUnique({
      where: { id: id },
      include: { images: true },
    });

    if (!product) {
      return next(new ValidationError('Product not found'));
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const editProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isArray(id)) {
      return next(new ValidationError('Product ID is required'));
    }

    const existingProduct = await prisma.products.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingProduct) {
      return next(new ValidationError('Product not found'));
    }

    if (existingProduct.sellerId !== req.seller?.id) {
      return next(
        new ValidationError('You are not authorized to edit this product'),
      );
    }

    const {
      title,
      description,
      detailedDescription,
      tags,
      warranty,
      slug,
      brand,
      cashOnDelivery = 'yes',
      video_url,
      videoUrl,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      discountCode,
      stock,
      sale_price,
      salePrice,
      regular_price,
      regularPrice,
      subCategory,
      customProperties = {},
      images = [],
      specifications = [],
      status = 'Active',
    } = req.body;

    const actualSalePrice = sale_price ?? salePrice;
    const actualRegularPrice = regular_price ?? regularPrice;
    const actualVideoUrl = video_url ?? videoUrl;
    const actualDiscountCode = discountCodes ?? discountCode;

    if (status !== 'Draft') {
      if (
        !title ||
        !description ||
        !detailedDescription ||
        !tags ||
        !warranty ||
        !slug ||
        !category ||
        !subCategory ||
        actualSalePrice === undefined ||
        actualSalePrice === null ||
        actualSalePrice === '' ||
        stock === undefined ||
        stock === null ||
        stock === ''
      ) {
        return next(
          new ValidationError('All required fields must be provided'),
        );
      }
    } else {
      if (!title || !slug) {
        return next(
          new ValidationError('Title and slug are required to save draft'),
        );
      }
    }

    if (slug !== existingProduct.slug) {
      const isSlugExist = await prisma.products.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (isSlugExist) {
        return next(
          new ValidationError(
            'Product slug already exists. Please choose another slug!',
          ),
        );
      }
    }

    const parsedSalePrice = actualSalePrice ? parseFloat(actualSalePrice) : 0;
    const parsedRegularPrice = actualRegularPrice
      ? parseFloat(actualRegularPrice)
      : null;
    const parsedStock = stock ? parseInt(stock, 10) : 0;

    const formattedDiscountCodes = Array.isArray(actualDiscountCode)
      ? (actualDiscountCode as string[])
      : actualDiscountCode
        ? [actualDiscountCode as string]
        : [];

    const formattedTags = Array.isArray(tags)
      ? (tags as string[])
      : typeof tags === 'string' && tags.trim() !== ''
        ? tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

    const productImages = Array.isArray(images)
      ? images
          .filter((img: any) => img && (img.fileUrl || img.url))
          .map((img: any) => ({
            file_id: img.fileId || img.file_id || '',
            url: img.fileUrl || img.url || '',
          }))
      : [];

    await prisma.images.deleteMany({
      where: { productId: id },
    });

    const updatedProduct = await prisma.products.update({
      where: { id },
      data: {
        title,
        description: description || '',
        detailedDescription: detailedDescription || '',
        tags: formattedTags,
        warranty: warranty || '',
        slug,
        brand: brand || null,
        cashOnDelivery: cashOnDelivery || 'yes',
        video_url: actualVideoUrl || null,
        category: category || '',
        subCategory: subCategory || '',
        colors: Array.isArray(colors) ? (colors as string[]) : [],
        sizes: Array.isArray(sizes) ? (sizes as string[]) : [],
        discountCodes: formattedDiscountCodes,
        stock: parsedStock,
        sale_price: parsedSalePrice,
        regular_price: parsedRegularPrice,
        customProperties: customProperties as any,
        images: {
          create: productImages,
        },
        specifications: Array.isArray(specifications)
          ? (specifications as any)
          : [],
        status: status === 'Draft' ? 'Draft' : 'Active',
      },
      include: {
        images: true,
      },
    });

    return res.status(200).json({
      success: true,
      message:
        status === 'Draft'
          ? 'Product draft updated successfully'
          : 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

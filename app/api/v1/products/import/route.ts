import dbConnect from '@/lib/db/mongoose';
import { Product } from '@/lib/models/Product';
import { Category } from '@/lib/models/Category';
import { generateSku } from '@/lib/utils/skuGenerator';
import { logAction } from '@/lib/utils/auditLogger';
import { apiSuccess, apiError } from '@/lib/utils/apiResponse';
import { requireApiAuth } from '@/lib/utils/requireApiAuth';
import { ROLES } from '@/lib/utils/rbac';
import { Types } from 'mongoose';
import { z } from 'zod';

const ImportProductItemSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().optional(),
  categoryName: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit of measure is required'),
  costPrice: z.number().nonnegative('Cost price cannot be negative'),
  sellingPrice: z.number().nonnegative('Selling price cannot be negative'),
  description: z.string().optional(),
  reorderPoint: z.number().int().nonnegative().optional(),
});

const ImportSchema = z.object({
  products: z.array(ImportProductItemSchema).min(1, 'At least one product is required'),
});

export async function POST(request: Request) {
  const check = requireApiAuth(request, ROLES.adminOnly);
  if ('response' in check) return check.response;
  await dbConnect();

  try {
    const body = await request.json();
    const parsed = ImportSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid input data structure', 400, parsed.error.format());
    }

    const { products: importList } = parsed.data;
    const { businessId, userId } = check.auth;

    // Fetch existing categories to avoid redundant creations
    const existingCategories = await Category.find({ businessId });
    const categoryCache: Record<string, Types.ObjectId> = {};
    existingCategories.forEach((cat) => {
      categoryCache[cat.name.toLowerCase().trim()] = cat._id as Types.ObjectId;
    });

    const productsToInsert = [];
    const baseSkuCount = await Product.countDocuments({ businessId });
    let skuIndex = 1;

    for (const item of importList) {
      const catKey = item.categoryName.toLowerCase().trim();
      let categoryId = categoryCache[catKey];

      // If category doesn't exist, create it on-the-fly!
      if (!categoryId) {
        const newCat = new Category({
          name: item.categoryName.trim(),
          description: `Auto-created during bulk import`,
          businessId,
          createdBy: new Types.ObjectId(userId),
        });
        await newCat.save();
        categoryId = newCat._id as Types.ObjectId;
        categoryCache[catKey] = categoryId; // Add to cache for subsequent rows
      }

      const sku = item.sku?.trim() || generateSku('SP', baseSkuCount + skuIndex++);

      productsToInsert.push({
        name: item.name.trim(),
        sku,
        category: categoryId,
        unit: item.unit.trim(),
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        description: item.description?.trim() || '',
        reorderPoint: item.reorderPoint ?? 10,
        currentStock: 0, // Starts at 0, must be stock-in transacted
        businessId,
        createdBy: new Types.ObjectId(userId),
      });
    }

    // Bulk insert products
    const inserted = await Product.insertMany(productsToInsert);

    // Audit Log
    await logAction({
      userId,
      action: 'PRODUCTS_BULK_IMPORTED',
      entity: 'Product',
      entityId: inserted[0]?._id?.toString() || 'bulk',
      after: { count: inserted.length },
    });

    return apiSuccess({ count: inserted.length }, 201);
  } catch (e: unknown) {
    return apiError(e instanceof Error ? e.message : 'Failed to import products', 400);
  }
}

import { Types } from 'mongoose';
import { Product } from '../models/Product';
import { StockTransaction } from '../models/StockTransaction';

export async function getInventoryValuation(businessId: string) {
  const products = await Product.find({ businessId, isArchived: false }).populate('category');

  const categoriesMap: Record<
    string,
    {
      categoryName: string;
      totalItems: number;
      totalCostValue: number;
      totalSellingValue: number;
    }
  > = {};

  let totalItemsCount = 0;
  let grandCostValue = 0;
  let grandSellingValue = 0;

  for (const p of products) {
    const catId = p.category ? (p.category as any)._id.toString() : 'uncategorized';
    const catName = p.category ? (p.category as any).name : 'Uncategorized';
    const qty = p.currentStock || 0;
    const cost = p.costPrice || 0;
    const sell = p.sellingPrice || 0;

    if (!categoriesMap[catId]) {
      categoriesMap[catId] = {
        categoryName: catName,
        totalItems: 0,
        totalCostValue: 0,
        totalSellingValue: 0,
      };
    }

    categoriesMap[catId].totalItems += qty;
    categoriesMap[catId].totalCostValue += qty * cost;
    categoriesMap[catId].totalSellingValue += qty * sell;

    totalItemsCount += qty;
    grandCostValue += qty * cost;
    grandSellingValue += qty * sell;
  }

  return {
    categories: Object.values(categoriesMap),
    summary: {
      totalItemsCount,
      grandCostValue,
      grandSellingValue,
    },
  };
}

export async function getStockMovementReport(
  businessId: string,
  filter: { from?: string; to?: string; productId?: string; type?: string }
) {
  const query: Record<string, unknown> = { businessId };

  if (filter.productId) {
    query.product = new Types.ObjectId(filter.productId);
  }
  if (filter.type) {
    query.type = filter.type;
  }

  if (filter.from || filter.to) {
    const dateQuery: Record<string, unknown> = {};
    if (filter.from) {
      dateQuery.$gte = new Date(filter.from);
    }
    if (filter.to) {
      const toDate = new Date(filter.to);
      toDate.setHours(23, 59, 59, 999);
      dateQuery.$lte = toDate;
    }
    query.createdAt = dateQuery;
  }

  return StockTransaction.find(query)
    .populate('product', 'name sku unit')
    .populate('performedBy', 'name email')
    .sort({ createdAt: -1 });
}

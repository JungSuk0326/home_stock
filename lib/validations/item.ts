import { z } from 'zod'

export const createItemSchema = z.object({
  name: z.string().min(1, '제품명은 필수입니다'),
  description: z.string().optional(),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  qrCode: z.string().optional(),
  quantity: z.number().int().min(0, '수량은 0 이상이어야 합니다').default(0),
  minQuantity: z.number().int().min(0).default(0),
  unit: z.string().default('개'),
  categoryId: z.string().min(1, '카테고리는 필수입니다'),
  locationId: z.string().min(1, '보관 위치는 필수입니다'),
  expiryDate: z.string().datetime().optional().or(z.null()),
  purchaseDate: z.string().datetime().optional().or(z.null()),
  openedDate: z.string().datetime().optional().or(z.null()),
  price: z.number().positive().optional().or(z.null()),
  purchaseStore: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.null()),
  memo: z.string().optional(),
})

export const updateItemSchema = createItemSchema.partial()

export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>

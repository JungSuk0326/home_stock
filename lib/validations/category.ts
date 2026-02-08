import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, '카테고리명은 필수입니다'),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

import { z } from 'zod'

export const createLocationSchema = z.object({
  name: z.string().min(1, '위치명은 필수입니다'),
  description: z.string().optional(),
  icon: z.string().optional(),
})

export const updateLocationSchema = createLocationSchema.partial()

export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>

import { z } from 'zod';

export const CustomConfigValueTypeSchema = z.enum(['string', 'boolean', 'number', 'object', 'array']);
export type CustomConfigValueType = z.infer<typeof CustomConfigValueTypeSchema>;

export const CustomConfigSchema = z.object({
  code: z.string(),
  periodCode: z.number().nullable(),
  description: z.string(),
  value: z.any(),
  valueType: CustomConfigValueTypeSchema,
  helperType: z.string().nullable(),
  parentCode: z.string().nullable(),
  isEditable: z.boolean(),
  isActive: z.boolean(),
  postDate: z.string(),
  createdAt: z.number(),
  createdBy: z.string(),
  updatedAt: z.number().nullable(),
  updatedBy: z.string().nullable(),
});

export type CustomConfig = z.infer<typeof CustomConfigSchema>;

export const CreateCustomConfigRequestSchema = z.object({
  code: z.string(),
  periodCode: z.number().nullable(),
  description: z.string(),
  value: z.any(),
  valueType: CustomConfigValueTypeSchema,
  helperType: z.string().nullable(),
  parentCode: z.string().nullable(),
  isEditable: z.boolean(),
  isActive: z.boolean(),
});

export type CreateCustomConfigRequest = z.infer<typeof CreateCustomConfigRequestSchema>;

export const UpdateCustomConfigRequestSchema = z.object({
  description: z.string().optional(),
  value: z.any().optional(),
});

export type UpdateCustomConfigRequest = z.infer<typeof UpdateCustomConfigRequestSchema>;

const VipLevelSchema = z.object({
  name: z.string(),
  uptraderCode: z.number(),
  order: z.number(),
  bonusPoints: z.number(),
  requirements: z.object({
    depositMinAmount: z.string().optional(),
    depositMaxAmount: z.string().optional(),
    lotMinAmount: z.string(),
    lotMaxAmount: z.string(),
  }),
});

export type VipLevel = z.infer<typeof VipLevelSchema>;

export const VipConfigSchema = z.object({
  promotionValidDateRange: z.number(),
  depositInExp: z.string().optional(),
  lotInExp: z.string().optional(),
  levels: z.array(VipLevelSchema),
});

export type VipConfig = z.infer<typeof VipConfigSchema>;

export const UpdateVipLevelRequestSchema = z.object({
  name: z.string().optional(),
  uptraderCode: z.number().optional(),
  order: z.number().optional(),
  bonusPoints: z.number().optional(),
  requirements: z
    .object({
      depositMinAmount: z.string().optional(),
      depositMaxAmount: z.string().optional(),
      lotMinAmount: z.string(),
      lotMaxAmount: z.string(),
    })
    .optional(),
});

export type UpdateVipLevelRequest = z.infer<typeof UpdateVipLevelRequestSchema>;

export const UpdateVipConfigRequestSchema = z.object({
  promotionValidDateRange: z.number().optional(),
  depositInExp: z.string().optional(),
  lotInExp: z.string().optional(),
  levels: z.array(UpdateVipLevelRequestSchema).optional(),
});

export type UpdateVipConfigRequest = z.infer<typeof UpdateVipConfigRequestSchema>;

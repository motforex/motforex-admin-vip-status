import { z } from 'zod';

const NumericString = z.string().refine((val) => !isNaN(Number(val)), {
  message: 'Must be a valid numeric string',
});

export const VipConfigSchema = z
  .object({
    title: z.string(),
    subTitle: z.string(),
    level: z.number(),
    description: z.string().optional(),
    statusColor: z.string().optional(),
    isButtonEnabled: z.boolean().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
    promoTexts: z.array(z.string()).optional(),
    lotMinAmount: NumericString,
    lotMaxAmount: NumericString,
  })
  .strict();

export type VipConfig = z.infer<typeof VipConfigSchema>;

export const CustomConfigValueTypeSchema = z.enum(['string', 'boolean', 'number', 'object', 'array']);
export type CustomConfigValueType = z.infer<typeof CustomConfigValueTypeSchema>;

export const CustomConfigSchema = z
  .object({
    code: z.string(),
    periodCode: z.number().nullable(),
    description: z.string(),
    value: VipConfigSchema,
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
  })
  .strict();

export type CustomConfig = z.infer<typeof CustomConfigSchema>;

export const CreateCustomConfigRequestSchema = z
  .object({
    code: z.string(),
    periodCode: z.number().nullable(),
    description: z.string(),
    value: VipConfigSchema,
    valueType: CustomConfigValueTypeSchema,
    helperType: z.string().nullable(),
    parentCode: z.string().nullable(),

    isEditable: z.boolean(),
    isActive: z.boolean(),
  })
  .strict();

export type CreateCustomConfigRequest = z.infer<typeof CreateCustomConfigRequestSchema>;

export const UpdateCustomConfigRequestSchema = z.object({
  code: z.string(),
  periodCode: z.number().nullable(),
  description: z.string(),
  value: VipConfigSchema,
  valueType: CustomConfigValueTypeSchema,
  helperType: z.string().nullable(),
  parentCode: z.string().nullable(),
  isEditable: z.boolean(),
  isActive: z.boolean(),
});

export type UpdateCustomConfigRequest = z.infer<typeof UpdateCustomConfigRequestSchema>;

export const CreateVipConfigRequestSchema = z
  .object({
    title: z.string(),
    subTitle: z.string(),
    level: z.number(),
    description: z.string(),
    statusColor: z.string().optional(),
    isButtonEnabled: z.boolean().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
    promoTexts: z.array(z.string()).optional(),
    lotMinAmount: NumericString,
    lotMaxAmount: NumericString,
  })
  .strict();

// --- Update VIP Config Request Schema ---
export const UpdateVipConfigRequestSchema = z
  .object({
    title: z.string(),
    subTitle: z.string(),
    level: z.number(),
    description: z.string(),
    statusColor: z.string().optional(),
    isButtonEnabled: z.boolean().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
    promoTexts: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    lotMinAmount: NumericString,
    lotMaxAmount: NumericString,
  })
  .strict();

export type UpdateVipConfigRequest = z.infer<typeof UpdateVipConfigRequestSchema>;

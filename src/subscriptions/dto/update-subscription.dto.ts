import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateSubscriptionSchema = z.object({
  priceId: z.string().min(1),
});

export class UpdateSubscriptionDto extends createZodDto(UpdateSubscriptionSchema) {}

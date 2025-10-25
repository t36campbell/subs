import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SubscriptionSchema = z.object({
  priceId: z.string().min(1),
});

export class Subscription extends createZodDto(SubscriptionSchema) {}

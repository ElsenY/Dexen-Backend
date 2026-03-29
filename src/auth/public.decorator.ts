import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Skips JWT validation when used with the global {@link JwtAuthGuard}. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

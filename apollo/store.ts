import { makeVar } from '@apollo/client';

import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';

export const currentUserVar = makeVar<CustomJwtPayload | null>(null);

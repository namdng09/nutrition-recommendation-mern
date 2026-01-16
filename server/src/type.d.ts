import { HydratedDocument } from 'mongoose';

import type { User } from '~/shared/database/models/user-model';

declare global {
  namespace Express {
    type User = HydratedDocument<User>;
  }
}

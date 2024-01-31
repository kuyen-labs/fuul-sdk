import { Conversion } from '@conversions/types';
import { EventArgs, UserMetadata } from '@events/types';

import Fuul, { FuulSettings } from './tracking';

export * from '@affiliates/infra/errors';
export type { Conversion, EventArgs, FuulSettings, UserMetadata };

export { Fuul };

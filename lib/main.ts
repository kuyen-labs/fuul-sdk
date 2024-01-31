import { Conversion } from '../src/modules/conversions/types';
import { EventArgs, UserMetadata } from '../src/modules/events/types';
import Fuul, { FuulSettings } from './core';

export * from '../src/modules/affiliates/infra/errors';
export * from './ui';

export type { Conversion, EventArgs, FuulSettings, UserMetadata };

export { Fuul };

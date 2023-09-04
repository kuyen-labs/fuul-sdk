import {
  generateTrackingLink,
  getAllConversions,
  init,
  isInitialized,
  sendConnectWalletEvent,
  sendEvent,
  sendPageViewEvent,
  verifyConnection,
} from './core';

export type { ConversionDTO } from './infrastructure/conversions/dtos';

export default {
  init,
  isInitialized,
  sendEvent,
  sendConnectWalletEvent,
  sendPageViewEvent,
  verifyConnection,
  getAllConversions,
  generateTrackingLink,
};

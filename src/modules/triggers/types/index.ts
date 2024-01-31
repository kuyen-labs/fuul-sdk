enum EventType {
  OnChainFunction = 'on-chain-function',
  OnChainInternalFunction = 'on-chain-internal-function',
  OnChainEvent = 'on-chain-event',
  OffChainEvent = 'off-chain-event',
}

interface Contract {
  address: string;
  network: string;
}

export interface Trigger {
  id: string;
  name: string;
  description: string;
  ref: string;
  signature: string;
  type: EventType;
  condition_expression: string;
  end_user_argument: string;
  contracts?: Contract[];
}

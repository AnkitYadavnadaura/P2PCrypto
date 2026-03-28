export const ORDER_STATUS = {
  CREATED: "CREATED",
  FUNDED: "FUNDED",
  PAID: "PAID",
  RELEASED: "RELEASED",
  CANCELLED: "CANCELLED",
  DISPUTED: "DISPUTED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: [ORDER_STATUS.FUNDED, ORDER_STATUS.CANCELLED],
  FUNDED: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED, ORDER_STATUS.DISPUTED],
  PAID: [ORDER_STATUS.RELEASED, ORDER_STATUS.DISPUTED],
  RELEASED: [],
  CANCELLED: [],
  DISPUTED: [ORDER_STATUS.RELEASED, ORDER_STATUS.CANCELLED],
};

export function canTransitionStatus(from: string | null | undefined, to: OrderStatus) {
  if (!from) return false;
  const transitions = ALLOWED_TRANSITIONS[from as OrderStatus];
  if (!transitions) return false;
  return transitions.includes(to);
}

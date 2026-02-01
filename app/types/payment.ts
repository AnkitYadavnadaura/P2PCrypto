export type PaymentMethodType = "UPI" | "BANK" | "BINANCE";

export interface PaymentMethodBase {
  id: string;
  type: PaymentMethodType;
  createdAt: number;
}

export interface UPIMethod extends PaymentMethodBase {
  type: "UPI";
  upiId: string;
  qrUrl: string;
}

export interface BankMethod extends PaymentMethodBase {
  type: "BANK";
  holderName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export interface BinanceMethod extends PaymentMethodBase {
  type: "BINANCE";
  binanceId?: string;
  qrUrl?: string;
}

export type PaymentMethod =
  | UPIMethod
  | BankMethod
  | BinanceMethod;

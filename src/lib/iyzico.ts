import crypto from "node:crypto";

import { PAYMENTS_ENABLED } from "@/lib/features";

const defaultBaseUrl = process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";

export type IyzicoBasketItem = {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: "PHYSICAL" | "VIRTUAL";
  price: number;
};

export type IyzicoInitializePayload = {
  locale?: "tr" | "en";
  conversationId: string;
  price: number;
  paidPrice: number;
  currency?: "TRY" | "USD" | "EUR" | "GBP" | "NOK" | "CHF";
  basketId: string;
  paymentGroup?: "PRODUCT" | "LISTING" | "SUBSCRIPTION";
  callbackUrl: string;
  enabledInstallments?: number[];
  buyer: Record<string, unknown>;
  shippingAddress?: Record<string, unknown>;
  billingAddress: Record<string, unknown>;
  basketItems: IyzicoBasketItem[];
};

function getIyzicoSecrets() {
  if (!PAYMENTS_ENABLED) {
    throw new Error("Ödeme sistemi geçici olarak pasif.");
  }

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("IYZICO_API_KEY or IYZICO_SECRET_KEY is missing.");
  }

  return { apiKey, secretKey };
}

function createAuthorization(path: string, body: string) {
  const { apiKey, secretKey } = getIyzicoSecrets();
  const randomKey = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(`${randomKey}${path}${body}`)
    .digest("hex");
  const authString = Buffer.from(
    `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`
  ).toString("base64");

  return {
    authorization: `IYZWSv2 ${authString}`,
    randomKey
  };
}

async function iyzicoRequest<T>(path: string, payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  const { authorization, randomKey } = createAuthorization(path, body);

  const response = await fetch(`${defaultBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
      "x-iyzi-rnd": randomKey
    },
    body
  });

  const data = (await response.json()) as T & {
    status?: string;
    errorMessage?: string;
  };

  if (!response.ok || data.status === "failure") {
    throw new Error(data.errorMessage ?? "İyzico isteği başarısız oldu.");
  }

  return data;
}

export async function initializeCheckoutForm(payload: IyzicoInitializePayload) {
  return iyzicoRequest<{
    status: string;
    token: string;
    paymentPageUrl: string;
    checkoutFormContent?: string;
    conversationId: string;
  }>("/payment/iyzipos/checkoutform/initialize/auth/ecom", {
    locale: "tr",
    currency: "TRY",
    paymentGroup: "SUBSCRIPTION",
    enabledInstallments: [1, 2, 3, 6],
    ...payload
  });
}

export async function retrieveCheckoutForm(token: string, conversationId?: string) {
  return iyzicoRequest<{
    status: string;
    paymentStatus: "SUCCESS" | "FAILURE" | "CALLBACK_THREEDS";
    paymentId?: string;
    token?: string;
    price?: number;
    paidPrice?: number;
    basketId?: string;
    conversationId?: string;
  }>("/payment/iyzipos/checkoutform/auth/ecom/detail", {
    locale: "tr",
    conversationId,
    token
  });
}

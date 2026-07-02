/**
 * PurchaseService — the same shape RevenueCat expects: init, get product,
 * purchase, restore. Mocked here; wire the SDK in behind this seam.
 */

export type ProductId = 'remove_ads';

export interface PurchaseOutcome {
  success: boolean;
  productId?: ProductId;
  reason?: 'cancelled' | 'network' | 'error' | 'already_owned';
}

export interface PurchaseService {
  init(): Promise<void>;
  isOwned(productId: ProductId): boolean;
  purchase(productId: ProductId): Promise<PurchaseOutcome>;
  restore(): Promise<PurchaseOutcome[]>;
}

class MockPurchaseService implements PurchaseService {
  private owned: Partial<Record<ProductId, boolean>> = {};

  async init(): Promise<void> {
    /* no-op */
  }

  isOwned(productId: ProductId): boolean {
    return !!this.owned[productId];
  }

  async purchase(productId: ProductId): Promise<PurchaseOutcome> {
    await new Promise((r) => setTimeout(r, 300));
    if (this.owned[productId]) {
      return { success: false, productId, reason: 'already_owned' };
    }
    this.owned[productId] = true;
    return { success: true, productId };
  }

  async restore(): Promise<PurchaseOutcome[]> {
    return Object.entries(this.owned)
      .filter(([, owned]) => owned)
      .map(([id]) => ({ success: true, productId: id as ProductId }));
  }
}

let instance: PurchaseService = new MockPurchaseService();

export function getPurchaseService(): PurchaseService {
  return instance;
}

export function setPurchaseService(service: PurchaseService): void {
  instance = service;
}

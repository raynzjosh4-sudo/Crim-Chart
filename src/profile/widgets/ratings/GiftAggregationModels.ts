/** Aggregate gift data for a recipient on the profile ratings view. */
export interface GiftAggregation {
  giftId: string;
  giftName: string;
  giftImageUrl?: string;
  totalReceived: number;
  totalValue: number;
}

export interface GiftSummary {
  recipientId: string;
  aggregations: GiftAggregation[];
  grandTotalGifts: number;
  grandTotalValue: number;
}

export function buildGiftSummary(rows: Record<string, unknown>[]): GiftSummary {
  const aggs = new Map<string, GiftAggregation>();
  for (const r of rows) {
    const id = String(r['gift_id'] ?? r['giftId'] ?? '');
    const existing = aggs.get(id);
    const count = Number(r['count'] ?? r['received'] ?? 1);
    const value = Number(r['value'] ?? r['coin_value'] ?? 0);
    if (existing) {
      existing.totalReceived += count;
      existing.totalValue += value;
    } else {
      aggs.set(id, {
        giftId: id,
        giftName: String(r['gift_name'] ?? r['name'] ?? 'Gift'),
        giftImageUrl: r['gift_image_url'] as string | undefined,
        totalReceived: count,
        totalValue: value,
      });
    }
  }
  const aggregations = [...aggs.values()].sort((a, b) => b.totalReceived - a.totalReceived);
  return {
    recipientId: String(rows[0]?.['recipient_id'] ?? ''),
    aggregations,
    grandTotalGifts: aggregations.reduce((s, a) => s + a.totalReceived, 0),
    grandTotalValue: aggregations.reduce((s, a) => s + a.totalValue, 0),
  };
}

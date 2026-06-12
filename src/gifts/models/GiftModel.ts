export interface GiftModel {
  id: string;
  name: string;
  coinPrice: number;
  imageUrl: string;
  badge?: string;
  isAnimated: boolean;
}

export function giftFromMap(map: Record<string, unknown>): GiftModel {
  return {
    id: String(map['id'] ?? ''),
    name: String(map['name'] ?? ''),
    coinPrice: Number(map['coinPrice'] ?? map['coin_price'] ?? 0),
    imageUrl: String(map['imageUrl'] ?? map['image_url'] ?? ''),
    badge: map['badge'] as string | undefined,
    isAnimated: Boolean(map['isAnimated'] ?? map['is_animated']),
  };
}

export const EMPTY_GIFT: GiftModel = {
  id: '', name: '', coinPrice: 0, imageUrl: '', isAnimated: false,
};

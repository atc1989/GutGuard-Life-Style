const PESO_PER_POINT = 10;
const FIRST_ORDER_CAP = 4500;

export function firstOrderEarned(points: number, banked: number) {
  return Math.min(points * PESO_PER_POINT + banked, FIRST_ORDER_CAP);
}

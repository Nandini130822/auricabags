/** Demo courier rate/ETA quotes — deterministic from pincode so the client sees stable numbers. */
export type Quote = { courier: string; rate: number; etaDays: number };

export function isServiceable(pincode: string) {
  return /^\d{6}$/.test(pincode) && !pincode.startsWith("0") && !pincode.startsWith("99");
}

export function quoteCouriers(pincode: string, couriers: string[], fromPincode = "395009"): Quote[] {
  if (!isServiceable(pincode)) return [];
  const sameZone = pincode.slice(0, 2) === fromPincode.slice(0, 2);
  const seed = pincode.split("").reduce((s, d) => s + Number(d), 0);
  return couriers.map((courier, i) => ({
    courier,
    rate: (sameZone ? 49 : 79) + ((seed * (i + 3)) % 40) + i * 6,
    etaDays: (sameZone ? 2 : 4) + ((seed + i) % 3),
  }));
}

export const SHIP_FLOW = ["created", "picked_up", "in_transit", "out_for_delivery", "delivered"] as const;
export const SHIP_LABEL: Record<string, string> = {
  created: "Shipment created",
  picked_up: "Picked up from Aurica studio",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  rto: "Returned to origin",
};

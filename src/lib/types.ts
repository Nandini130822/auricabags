export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  images: string[];
  colors: string[];
  occasions: string[];
  material: string | null;
  dimensions: string | null;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  product?: { name: string; slug: string } | null;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  type: "percent" | "flat";
  value: number;
  min_order: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type Address = {
  id?: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "card" | "upi" | "netbanking" | "cod";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  image: string | null;
  color: string | null;
  price: number;
  quantity: number;
};

export type Payment = {
  id: string;
  order_id: string;
  provider: string;
  provider_payment_id: string | null;
  method: string;
  amount: number;
  status: "created" | "captured" | "failed" | "refunded";
  created_at: string;
  order?: { order_number: string; customer_name: string } | null;
};

export type ShipmentEvent = { status: string; label: string; location: string; at: string };

export type Shipment = {
  id: string;
  order_id: string;
  courier: string;
  awb: string;
  status: "created" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "rto";
  events: ShipmentEvent[];
  eta: string | null;
  created_at: string;
  order?: { order_number: string; customer_name: string; shipping_address: Address } | null;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  customer_name: string;
  phone: string;
  shipping_address: Address;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
  payments?: Payment[];
  shipments?: Shipment[];
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "customer" | "admin";
  is_blocked: boolean;
  created_at: string;
};

export type StoreSettings = {
  payment: {
    provider: string;
    mode: "test" | "live";
    key_id: string;
    cod_enabled: boolean;
    upi_enabled: boolean;
    card_enabled: boolean;
    netbanking_enabled: boolean;
  };
  delivery: {
    provider: string;
    mode: "test" | "live";
    pickup_pincode: string;
    free_shipping_above: number;
    flat_fee: number;
    couriers: string[];
  };
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  color: string | null;
  quantity: number;
  stock: number;
};

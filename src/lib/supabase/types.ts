export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      subscription_plans: {
        Row: {
          id: string
          code: string
          name: string
          status: string
          billing_provider_product_id: string | null
          created_at: string
        }
      }
      features: {
        Row: {
          id: string
          key: string
          name: string
          description: string
          module: string
          status: string
        }
      }
      plan_features: {
        Row: {
          plan_id: string
          feature_id: string
          limit_value: number | null
          configuration: Json
        }
      }
      vendor_subscriptions: {
        Row: {
          id: string
          vendor_id: string
          plan_id: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          plan_id: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          trial_ends_at?: string | null
        }
        Update: {
          plan_id?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          trial_ends_at?: string | null
        }
      }
      vendor_entitlements: {
        Row: {
          id: string
          vendor_id: string
          feature_id: string
          source: string
          enabled: boolean
          limit_value: number | null
          starts_at: string | null
          ends_at: string | null
          subscription_id: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          vendor_id: string
          feature_id: string
          source: string
          enabled?: boolean
          limit_value?: number | null
          starts_at?: string | null
          ends_at?: string | null
          subscription_id?: string | null
          metadata?: Json
        }
        Update: {
          enabled?: boolean
          limit_value?: number | null
          starts_at?: string | null
          ends_at?: string | null
          metadata?: Json
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          slug: string
          plan: string
          status: string
          location: string | null
          logo_asset_id: string | null
          logo_url: string | null
          brand_color: string
          heading_font: string
          created_at: string
          updated_at: string
        }
        Update: {
          brand_color?: string
          heading_font?: string
          logo_asset_id?: string | null
          logo_url?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
      }
      pilot_inquiries: {
        Row: {
          id: string
          name: string
          email: string
          business_name: string
          phone: string | null
          city: string | null
          message: string | null
          consent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          business_name: string
          phone?: string | null
          city?: string | null
          message?: string | null
          consent: boolean
        }
      }
      vendor_members: {
        Row: {
          id: string
          vendor_id: string
          user_id: string
          role: string
          status: string
          avatar_asset_id: string | null
          created_at: string
          updated_at: string
        }
        Update: {
          avatar_asset_id?: string | null
        }
      }
      media_assets: {
        Row: {
          id: string
          vendor_id: string
          bucket: string
          object_path: string
          purpose: string
          mime_type: string
          width: number
          height: number
          size_bytes: number
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          bucket: string
          object_path: string
          purpose: string
          mime_type: string
          width: number
          height: number
          size_bytes: number
          created_by: string
        }
      }
      menu_categories: {
        Row: {
          id: string
          vendor_id: string
          name: string
          sort_order: number
          created_at: string
        }
      }
      menu_items: {
        Row: {
          id: string
          vendor_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          cost_price: number
          in_stock: boolean
          image_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Update: {
          in_stock?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          vendor_id: string
          token_no: number
          customer_label: string | null
          status: string
          payment_status: string
          payment_mode: string | null
          source: string
          note: string | null
          idempotency_key: string | null
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          vendor_id: string
          token_no: number
          customer_label?: string | null
          status?: string
          payment_status?: string
          payment_mode?: string | null
          source?: string
          note?: string | null
          idempotency_key?: string | null
          total?: number
        }
        Update: {
          status?: string
          payment_status?: string
          payment_mode?: string | null
          note?: string | null
          total?: number
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          item_name_snapshot: string
          quantity: number
          price_at_time: number
          created_at: string
        }
        Insert: {
          order_id: string
          menu_item_id?: string | null
          item_name_snapshot: string
          quantity: number
          price_at_time: number
        }
      }
      stock_items: {
        Row: {
          id: string
          vendor_id: string
          name: string
          unit: string
          current_qty: number
          reorder_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          vendor_id: string
          name: string
          unit: string
          current_qty?: number
          reorder_level?: number
        }
        Update: {
          name?: string
          unit?: string
          current_qty?: number
          reorder_level?: number
        }
      }
      stock_log: {
        Row: {
          id: string
          vendor_id: string
          stock_item_id: string
          quantity_delta: number
          reason: string
          created_at: string
        }
        Insert: {
          vendor_id: string
          stock_item_id: string
          quantity_delta: number
          reason: string
        }
      }
      ledger_entries: {
        Row: {
          id: string
          vendor_id: string
          entry_type: string
          amount: number
          note: string
          due_date: string | null
          settled_at: string | null
          created_at: string
        }
      }
    }
  }
}

export type Vendor = Database["public"]["Tables"]["vendors"]["Row"]
export type SubscriptionPlan =
  Database["public"]["Tables"]["subscription_plans"]["Row"]
export type Feature = Database["public"]["Tables"]["features"]["Row"]
export type PlanFeature =
  Database["public"]["Tables"]["plan_features"]["Row"]
export type VendorSubscription =
  Database["public"]["Tables"]["vendor_subscriptions"]["Row"]
export type VendorEntitlement =
  Database["public"]["Tables"]["vendor_entitlements"]["Row"]
export type VendorMember =
  Database["public"]["Tables"]["vendor_members"]["Row"]
export type MediaAsset = Database["public"]["Tables"]["media_assets"]["Row"]
export type MenuCategory =
  Database["public"]["Tables"]["menu_categories"]["Row"]
export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type StockItem = Database["public"]["Tables"]["stock_items"]["Row"]
export type StockLog = Database["public"]["Tables"]["stock_log"]["Row"]
export type LedgerEntry =
  Database["public"]["Tables"]["ledger_entries"]["Row"]

export type OrderWithItems = Order & {
  order_items: OrderItem[]
}

export type MenuItemWithCategory = MenuItem & {
  menu_categories: Pick<MenuCategory, "name"> | null
}

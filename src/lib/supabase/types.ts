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
      vendors: {
        Row: {
          id: string
          name: string
          slug: string
          plan: string
          status: string
          location: string | null
          logo_url: string | null
          brand_color: string
          heading_font: string
          created_at: string
          updated_at: string
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
          source: string
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
          source?: string
          total?: number
        }
        Update: {
          status?: string
          payment_status?: string
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

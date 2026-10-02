export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          description?: string | null
          created_at?: string
        }
      }
      admin_profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image: string | null
          status: 'active' | 'inactive'
          sort_order: number
          parent_id?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image?: string | null
          status?: 'active' | 'inactive'
          sort_order?: number
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image?: string | null
          status?: 'active' | 'inactive'
          sort_order?: number
          parent_id?: string | null
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          alt_text: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          slug: string
          title: string
          short_description: string | null
          description: string | null
          price: number
          category_id: string | null
          product_images: string[]
          video_url: string | null
          best_seller: boolean
          new_arrival: boolean
          featured: boolean
          status: 'active' | 'inactive'
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          short_description?: string | null
          description?: string | null
          price: number
          category_id?: string | null
          product_images?: string[]
          video_url?: string | null
          best_seller?: boolean
          new_arrival?: boolean
          featured?: boolean
          status?: 'active' | 'inactive'
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          short_description?: string | null
          description?: string | null
          price?: number
          category_id?: string | null
          product_images?: string[]
          video_url?: string | null
          best_seller?: boolean
          new_arrival?: boolean
          featured?: boolean
          status?: 'active' | 'inactive'
          sort_order?: number
          updated_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          image: string
          caption: string | null
          type: 'delivery' | 'event'
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          image: string
          caption?: string | null
          type?: 'delivery' | 'event'
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          image?: string
          caption?: string | null
          type?: 'delivery' | 'event'
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      reels: {
        Row: {
          id: string
          video: string
          thumbnail: string
          title: string
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          video: string
          thumbnail: string
          title: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          video?: string
          thumbnail?: string
          title?: string
          subtitle?: string | null
          display_order?: number
          product_id?: string | null
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      banners: {
        Row: {
          id: string
          image: string
          mobile_image?: string | null
          heading: string | null
          subtitle?: string | null
          button_text: string | null
          link: string | null
          link_type?: string | null
          display_order: number
          status: 'active' | 'inactive'
          start_date?: string | null
          end_date?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          image: string
          mobile_image?: string | null
          heading?: string | null
          subtitle?: string | null
          button_text?: string | null
          link?: string | null
          link_type?: string | null
          display_order?: number
          status?: 'active' | 'inactive'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          image?: string
          mobile_image?: string | null
          heading?: string | null
          subtitle?: string | null
          button_text?: string | null
          link?: string | null
          link_type?: string | null
          display_order?: number
          status?: 'active' | 'inactive'
          start_date?: string | null
          end_date?: string | null
          updated_at?: string
        }
      }
      offer_banners: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          badge_text: string | null
          image: string
          mobile_image: string | null
          button_text: string | null
          button_link: string | null
          background_color: string | null
          start_date: string | null
          end_date: string | null
          display_order: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          badge_text?: string | null
          image: string
          mobile_image?: string | null
          button_text?: string | null
          button_link?: string | null
          background_color?: string | null
          start_date?: string | null
          end_date?: string | null
          display_order?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          badge_text?: string | null
          image?: string
          mobile_image?: string | null
          button_text?: string | null
          button_link?: string | null
          background_color?: string | null
          start_date?: string | null
          end_date?: string | null
          display_order?: number
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      delivery_features: {
        Row: {
          id: string
          title: string
          description: string | null
          icon: string
          badge_type: 'ribbon' | 'trust_badge'
          display_order: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          icon: string
          badge_type?: 'ribbon' | 'trust_badge'
          display_order?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          icon?: string
          badge_type?: 'ribbon' | 'trust_badge'
          display_order?: number
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      media_assets: {
        Row: {
          id: string
          name: string
          file_url: string
          file_type: string
          file_size: number
          bucket: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          file_url: string
          file_type: string
          file_size?: number
          bucket?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          file_url?: string
          file_type?: string
          file_size?: number
          bucket?: string
        }
      }
      settings: {
        Row: {
          id: string
          store_name: string | null
          logo: string | null
          whatsapp_number: string | null
          phone: string | null
          email: string | null
          address: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          store_name?: string | null
          logo?: string | null
          whatsapp_number?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          store_name?: string | null
          logo?: string | null
          whatsapp_number?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          updated_at?: string
        }
      }
      team_users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'manager' | 'staff' | 'sales' | 'inventory' | 'delivery'
          phone: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: 'admin' | 'manager' | 'staff' | 'sales' | 'inventory' | 'delivery'
          phone?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'manager' | 'staff' | 'sales' | 'inventory' | 'delivery'
          phone?: string | null
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      work_logs: {
        Row: {
          id: string
          user_id: string
          work_date: string
          work_title: string
          work_description: string | null
          work_category: string
          status: 'completed' | 'in_progress' | 'pending'
          start_time: string | null
          end_time: string | null
          total_hours: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          work_date?: string
          work_title: string
          work_description?: string | null
          work_category?: string
          status?: 'completed' | 'in_progress' | 'pending'
          start_time?: string | null
          end_time?: string | null
          total_hours?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          work_date?: string
          work_title?: string
          work_description?: string | null
          work_category?: string
          status?: 'completed' | 'in_progress' | 'pending'
          start_time?: string | null
          end_time?: string | null
          total_hours?: number
          notes?: string | null
          updated_at?: string
        }
      }
      task_logs: {
        Row: {
          id: string
          assigned_to: string | null
          task_title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          assigned_date: string
          due_date: string | null
          completed_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assigned_to?: string | null
          task_title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          assigned_date?: string
          due_date?: string | null
          completed_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assigned_to?: string | null
          task_title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          assigned_date?: string
          due_date?: string | null
          completed_date?: string | null
          updated_at?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          report_date: string
          total_team_members: number
          members_worked: number
          total_tasks: number
          completed_tasks: number
          pending_tasks: number
          total_hours: number
          report_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_date?: string
          total_team_members?: number
          members_worked?: number
          total_tasks?: number
          completed_tasks?: number
          pending_tasks?: number
          total_hours?: number
          report_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_date?: string
          total_team_members?: number
          members_worked?: number
          total_tasks?: number
          completed_tasks?: number
          pending_tasks?: number
          total_hours?: number
          report_summary?: string | null
        }
      }
    }
  }
}

export type Category = Database['public']['Tables']['categories']['Row'] & {
  product_count?: number
}
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type Photo = Database['public']['Tables']['photos']['Row']
export type Reel = Database['public']['Tables']['reels']['Row']
export type Banner = Database['public']['Tables']['banners']['Row']
export type OfferBanner = Database['public']['Tables']['offer_banners']['Row']
export type DeliveryFeature = Database['public']['Tables']['delivery_features']['Row']
export type MediaAsset = Database['public']['Tables']['media_assets']['Row']
export type Settings = Database['public']['Tables']['settings']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type AdminProfile = Database['public']['Tables']['admin_profiles']['Row']

export type TeamUser = Database['public']['Tables']['team_users']['Row']
export type WorkLog = Database['public']['Tables']['work_logs']['Row']
export type TaskLog = Database['public']['Tables']['task_logs']['Row']
export type DailyReport = Database['public']['Tables']['daily_reports']['Row']

export type WorkLogWithUser = WorkLog & {
  team_users: Pick<TeamUser, 'id' | 'name' | 'email' | 'role'> | null
}

export type TaskLogWithUser = TaskLog & {
  team_users: Pick<TeamUser, 'id' | 'name' | 'email' | 'role'> | null
}

export type ProductWithCategory = Product & {
  categories: Pick<Category, 'id' | 'name' | 'slug'> | null
}
export type ProductWithImages = ProductWithCategory & {
  images: ProductImage[]
}

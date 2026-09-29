export interface HeroSlideData {
  id: string
  title?: string | null
  heading?: string | null
  subtitle?: string | null
  description?: string | null
  button_text?: string | null
  button_link?: string | null
  link?: string | null
  image_url?: string | null
  image?: string | null
  mobile_image?: string | null
  mobile_image_url?: string | null
  is_active?: boolean
  status?: 'active' | 'inactive' | string
  display_order?: number
  start_date?: string | null
  end_date?: string | null
}

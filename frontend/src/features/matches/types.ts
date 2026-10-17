export interface MutualMatchApiResponse {
  status: 'success' | 'error'
  message: string
  pagination?: {
    current_page: number
    total_pages: number
    total_results: number
    per_page: number
    has_next: boolean
    has_previous: boolean
  }
  results?: MutualMatchResult[]
}

export interface MutualMatchResult {
  MatriID: string
  Name: string
  Gender: string
  Age: string
  Height?: string
  Education?: string
  Occupation?: string
  Religion?: string
  Caste?: string
  Maritalstatus?: string
  Complexion?: string
  Star?: string
  Residencystatus?: string
  Country?: string
  State?: string
  District?: string
  City?: string
  Photo1?: string
  photo_url?: string
  VIP_profile?: string
  Status?: string
  is_blurred?: boolean
  watermark?: string
  profile_link?: string
}

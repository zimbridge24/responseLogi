// User types
export interface User {
  id: string
  email: string
  role: 'customer' | 'partner' | 'admin'
  name: string
  phone?: string
  companyName?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected' // 파트너 승인 상태
  createdAt: Date
  updatedAt: Date
}

// Request types (기존)
export interface Request {
  id: string
  customerId: string
  title: string
  description: string
  category: string
  budget?: number
  deadline?: Date
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  location?: string
  createdAt: Date
  updatedAt: Date
}

// Bid types (기존)
export interface Bid {
  id: string
  requestId: string
  partnerId: string
  amount: number
  description: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  estimatedDuration?: string
  createdAt: Date
  updatedAt: Date
}

// Chat types
export interface Chat {
  id: string
  requestId: string
  customerId: string
  partnerId: string
  status: 'active' | 'closed'
  createdAt: Date
  updatedAt?: Date
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  message: string
  type: 'text' | 'image' | 'file'
  createdAt: Date
}

// Notification types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  data?: any
  createdAt: Date
}

// Company types
export interface Company {
  id: string
  name: string
  description?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

// Warehouse Request types (창고 견적 신청)
export interface WarehouseRequest {
  id: string
  customerId: string
  customerName: string
  customerCompany: string
  customerPhone: string
  customerEmail: string
  pallets: number
  boxes: number
  storagePeriod: number
  storagePeriodUnit: 'day' | 'month' | 'year'
  locationPreference?: string
  specialRequirements?: string
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'completed'
  maxQuotes: number // 최대 견적 수 (기본 7개)
  currentQuoteCount: number // 현재 받은 견적 수
  createdAt: Date
  updatedAt: Date
}

// Warehouse Quote types (창고 견적 응답)
export interface WarehouseQuote {
  id: string
  requestId: string
  partnerId: string
  partnerName: string
  partnerCompany: string
  partnerPhone: string
  partnerEmail: string
  // 견적 상세 정보
  inboundFee: number // 입고비(개당)
  storageFee: number // 보관비(월) (PLT당)
  outboundFee: number // 출고비(개당)
  courierFeeSmall: number // 택배비(극소형)
  courierFeeMedium: number // 택배비(소형)
  courierCompany: string // 택배사
  wmsFee: number // WMS 비용
  description: string // 견적 설명
  keyFeatures: string // 주요 특징
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
  roles: string[];
  organization?: string;
  country?: string;
  profileImageUrl?: string;
}


export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface Setting {
  id: number;
  siteTitleEn: string;
  siteTitleAr: string;
  logoUrl: string;
  socialLinksJson: string; // JSON String representing {facebook, twitter, instagram, youtube, linkedin}
  contactInfo: string;     // JSON String representing {email, phone, address}
  signatoryName?: string;
  sealPhotoUrl?: string;
}


export interface CertificateDesign {
  id: number;
  primaryColor: string;
  secondaryColor: string;
  borderColor: string;
  borderWidth: number;
  titleEn: string;
  titleAr: string;
  headerTextEn: string;
  headerTextAr: string;
  signatoryName: string;
  signatoryTitleEn: string;
  signatoryTitleAr: string;
  signatureImageUrl: string | null;
  showLogo: boolean;
  logoHeight: number;
}

export interface ServiceFee {
  code: string;
  nameEn: string;
  nameAr: string;
  amount: number;
  currency: string;
}



export interface MediaCard {
  id: number;
  cardNumber: string;
  qrCodeData: string;
  status: number; // MediaCardStatus enum number
  issuedAt: string;
  expiresAt: string;
}

export interface Volunteer {
  id:          number;
  userId:      number;
  fullName:    string;
  email:       string;      // ✅ added — required in backend DTO
  phone:       string;      // ✅ added — required in backend DTO
  cvUrl:       string;
  skills?:     string;
  notes?:      string;      // optional — stored in backend but not in DTO yet; add after backend update
  area:        number;      // VolunteeringArea enum index (0–8)
  status:      string;      // ApplicationStatus enum string: "Pending" | "Approved" | "Rejected"
  appliedAt:   string;      // ✅ FIX: was submittedAt — backend field is AppliedAt
  adminNotes?: string;      // populated after admin review
}
export interface Course {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  feeAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  price: number;

}


export interface Enrollment {
  id: number;
  courseId: number;
  courseTitleEn: string;
  courseTitleAr: string;
  userId: number;
  userFullName: string;
  userEmail: string;
  status: EnrollmentStatus;
  createdAt: string;
  paymentId?: number;
  adminNotes?: string;
}

export enum EnrollmentStatus {
  PendingPayment = 0,
  Approved       = 1,
  Rejected       = 2
}


export interface Enrollment {
  id: number;
  courseId: number;
  userId: number;
  courseTitleEn: string;
  courseTitleAr: string;
  userFullName: string;
  userEmail: string;
  status: EnrollmentStatus;
  paymentId?: number;
  createdAt: string;
}
export interface Payment {
  id: number;
  userId: number;
  userFullName: string;      // كان userName
  userEmail: string;         // مش موجودة
  amount: number;
  senderName: string;
  referenceNumber: string;
  receiptUrl: string;        // كان receiptPhotoUrl
  type: number;
  relatedRecordId: number;
  status: number;            // بييجي كـ enum number من الـ backend
  createdAt: string;         // كان submittedAt
  verifiedAt?: string;
  verifiedByUserName?: string;
  adminNotes?: string;
}

export interface Certificate {
  id: number;
  userId: number;
  certificateNumber: string;
  fullNameOnCertificate: string;
  type: 'Training' | 'Volunteer';
  relatedRecordId: number;
  relatedItemTitle: string;
  issuedAt: string;
  pdfUrl: string;
  qrCodeData: string;
  expiredAt?: string;
  isExpired?: boolean;
}

export interface NewsArticle {
  id: number;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  imageUrl?: string;
  publishedAt: string;
  viewCount: number;
  type: 'News' | 'PressRelease';
}

export interface Partner {
  id: number;
  nameEn: string;
  nameAr: string;
  logoUrl?: string;
  websiteUrl?: string;
  category: 'Gold' | 'Silver' | 'Regular';
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entityName: string;
  entityId: string;
  details: string;
  createdAt: string;
  timestamp?: string;
  email?: string;
  ipAddress?: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type AccreditationCategory = {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} | any;

export const AccreditationCategoryLabel: Record<string | number, string> = {
  0: 'Press',
  1: 'Media',
  2: 'Staff',
  3: 'Organizer',
  4: 'Speaker',
  5: 'Guest',
  6: 'VIP',
  7: 'Trainee',
  8: 'Volunteer',
  9: 'Board Member',
  10: 'Executive',
  11: 'Honorary',
  12: 'Partner',
  'Press': 'Press',
  'Media': 'Media',
  'Staff': 'Staff',
  'Organizer': 'Organizer',
  'Speaker': 'Speaker',
  'Guest': 'Guest',
  'VIP': 'VIP',
  'Trainee': 'Trainee',
  'Volunteer': 'Volunteer',
  'Board Member': 'Board Member',
  'Executive': 'Executive',
  'Honorary': 'Honorary',
  'Partner': 'Partner'
};

  

export enum MediaCardStatus {
  Active = 0,
  Expired = 1,
  Suspended = 2 ,
  Revoked = 3
}

export const MediaCardStatusLabel: Record<string | number, string> = {
  'Active': 'ACTIVE',
  'Expired': 'EXPIRED',
  'Suspended': 'SUSPENDED',
  'Revoked': 'REVOKED',
  0: 'ACTIVE',
  1: 'EXPIRED',
  2: 'REVOKED',
  3: 'SUSPENDED'
};

export enum OrderType {
  CertificatePrint = 0,
  AccreditationCardPrint = 1
}

export enum OrderStatus {
  Pending = 0,
  WaitingPayment = 1,
  PaymentSubmitted = 2,
  UnderReview = 3,
  Approved = 4,
  InProduction = 5,
  Printed = 6,
  ReadyForDelivery = 7,
  Delivered = 8,
  Rejected = 9,
  Cancelled = 10
}

export interface Order {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  orderNumber: string;
  orderType: OrderType;
  relatedRecordId: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
    shippingFee: number;
  paymentId?: number;
  payment?: Payment;
  orderStatus: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
    phone?: string;
  address?: string;
}
// models/types.ts
export interface CreateOrderDto {
  orderType: OrderType;
  relatedRecordId: number;
  quantity: number;
  notes?: string;
  phone?: string;
  address?: string;
}
export interface ServiceFee {
  id: number;
  orderType: OrderType;
  unitPrice: number;
  shippingFee: number;
  isActive: boolean;
}
export interface OrderStatusHistory {
  id: number;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  changedByUserName: string;
  notes?: string;
  createdAt: string;
}


export interface MediaCardVerificationDataDto {
  id: number;
  cardNumber: string;
  fullName: string;
  categoryNameEn: string;
  categoryNameAr: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
  isExpired: boolean;
  qrCodeData: string;
}


export enum ApplicationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Refunded = 3
}

export interface Accreditation {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  categoryId: number;
  categoryNameEn: string;
  categoryNameAr: string;
  status: ApplicationStatus;     // ⚠️ number مش string
  documentUrl?: string;
  createdAt: string;
  checkedAt?: string;
  checkedByUserFullName?: string;
  mediaCard?: MediaCard;
  notes?: string;
}
// types.ts
export interface CertificateVerificationDataDto {
  id: number;
  certificateNumber: string;
  fullNameOnCertificate: string;
  type: string;
  relatedItemTitle: string | null;
  issuedAt: string;
  expiredAt: string;
  isExpired: boolean;
  qrCodeData: string;
}

export interface MediaCardVerificationDataDto {
  id: number;
  cardNumber: string;
  fullName: string;
  categoryNameEn: string;
  categoryNameAr: string;
  status: string;
  issuedAt: string;
  expiresAt: string;
  isExpired: boolean;
  qrCodeData: string;
}

export interface UnifiedVerificationResponseDto {
  isValid: boolean;
  type: 'certificate' | 'card' | null;   // ← string literal بدل string
  data: CertificateVerificationDataDto | MediaCardVerificationDataDto | null;
  message: string | null;
}
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

export interface Accreditation {
  id: number;
  userId: number;
  userFullName: string;         // اسم المستخدم من الـ User entity
  userEmail: string;
  category: string;             // AccreditationCategory enum string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Refunded';
  documentUrl?: string;
  createdAt: string;
  checkedAt?: string;
  checkedByUserFullName?: string;
  mediaCard?: MediaCard;        // nested card object
  notes: string;                   // populated after admin review
  nationalIdOrPassport?: string; // optional — not in backend DTO yet; add after backend update
  organization?: string;         // optional — not in backend DTO yet; add after backend update
  jobTitle?: string;             // optional — not in backend DTO yet; add after backend update
}

export interface MediaCard {
  id: number;
  cardNumber: string;
  qrCodeData: string;
  status: 'Active' | 'Expired' | 'Suspended' | 'Revoked';
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

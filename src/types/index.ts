// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Backend RegisterDto expects: name, phone, password (+ optional email) */
export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
  email?: string;
}

/** Backend LoginDto uses `identifier` (phone or email) */
export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export type KycStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';

/** Shape returned by backend user select */
export interface UserAccount {
  id: string;
  phone: string;
  name: string; // backend uses `name`, not firstName/lastName
  email?: string;
  avatarUrl?: string;
  roles: string[];
  status: AccountStatus;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  icon?: string;
  slug?: string;
}

export interface ProviderService {
  id: string;
  categoryId: string;
  category: Category;
  name: string;
  description?: string;
  priceType: 'FIXED' | 'QUOTE';
  price?: number;
  duration?: number;
  active: boolean;
}

export interface AvailabilityRule {
  id?: string;
  dayOfWeek: number; // 0=Sun … 6=Sat
  startTime: string; // 'HH:mm'
  endTime: string;
}

/** Shape returned by GET /provider/me */
export interface ProviderAccount {
  id: string;
  userId?: string;
  user: UserAccount;
  bio?: string;
  experience?: number;
  city?: string;
  zone?: string;
  available: boolean;
  kycStatus: KycStatus;
  averageRating: number; // backend field name
  reviewCount: number;
  completedJobs: number;
  services: ProviderService[];
  availability?: AvailabilityRule[];
  documents?: ProviderDocument[];
}

export interface ProviderDocument {
  id: string;
  type: string;
  url: string;
  verified: boolean;
}

/** Shape returned by GET /provider/me/stats */
export interface ProviderStats {
  averageRating: number;
  reviewCount: number;
  completedJobs: number;
  cancelledJobs: number;
  totalEarnings: number;
  acceptanceRate: number;
  // computed on frontend
  rating?: number;
  monthlyEarnings?: number;
  activeMissions?: number;
  pendingOffers?: number;
}

// ─── Service Request (DEMANDE) ───────────────────────────────────────────────

export type RequestStatus = 'OPEN' | 'QUOTED' | 'ACCEPTED' | 'CANCELLED' | 'EXPIRED';

export interface ServiceRequest {
  id: string;
  clientId: string;
  client: { name: string; avatarUrl?: string };
  categoryId: string;
  category: Category;
  description: string;
  photoUrls: string[];
  city?: string;
  status: RequestStatus;
  offerCount?: number;         // from _count.offers
  _count?: { offers: number }; // raw backend shape
  expiresAt: string;
  createdAt: string;
}

// ─── Offer (OFFRE) ───────────────────────────────────────────────────────────

export type OfferStatus =
  | 'PENDING'
  | 'SEEN'
  | 'COUNTER_OFFERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export interface Offer {
  id: string;
  requestId: string;
  request: ServiceRequest;
  providerId: string;
  provider: ProviderAccount;
  price: number;
  message?: string;
  proposedDate?: string;
  proposedSlot?: string;
  estimatedHours?: number;
  validUntil?: string;
  status: OfferStatus;
  counterPrice?: number;
  counterMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferPayload {
  requestId: string;
  price: number;
  message?: string;
  proposedDate?: string;
  proposedSlot?: string;
  estimatedHours?: number;
  validUntil?: string;
}

// ─── Mission / Booking ───────────────────────────────────────────────────────

export type BookingStatus =
  | 'CONFIRMED'
  | 'PROVIDER_EN_ROUTE'
  | 'PROVIDER_ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

/** Shape returned by GET /provider/me/bookings */
export interface Booking {
  id: string;
  clientId?: string;
  client: { name: string; avatarUrl?: string; phone?: string };
  providerId?: string;
  provider?: ProviderAccount;
  offerId?: string;
  offer?: Offer;
  service?: { name: string; duration?: number };
  category?: Category;
  scheduledDate: string; // backend uses scheduledDate
  slot?: string;
  estimatedHours?: number;
  totalAmount: number;
  platformFee: number;
  providerAmount: number;
  status: BookingStatus;
  address?: { line1: string; city: string } | string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'QUOTE_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'OFFER_COUNTER'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_RECEIVED'
  | 'REVIEW_RECEIVED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType | string;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
}

// ─── Update DTOs ─────────────────────────────────────────────────────────────

export interface UpdateProviderPayload {
  bio?: string;
  experience?: number;
  city?: string;
  zone?: string;
  available?: boolean;
}

export interface SetAvailabilityPayload {
  rules: AvailabilityRule[];
}

export interface AddServicePayload {
  categoryId: string;
  name: string;
  description?: string;
  priceType: 'FIXED' | 'QUOTE';
  price?: number;
  duration?: number;
}

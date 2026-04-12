// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'PROVIDER';
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
  purpose: 'REGISTER' | 'RESET_PASSWORD';
}

// ─── User / Provider ─────────────────────────────────────────────────────────

export type KycStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface UserAccount {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  accountStatus: AccountStatus;
  createdAt: string;
}

export interface ProviderService {
  id: string;
  categoryId: string;
  category: Category;
  basePrice?: number;
  active: boolean;
}

export interface AvailabilityRule {
  dayOfWeek: number; // 0=Sun, 6=Sat
  startTime: string; // 'HH:mm'
  endTime: string;
}

export interface ProviderAccount {
  id: string;
  userId: string;
  user: UserAccount;
  bio?: string;
  experience?: number;
  city?: string;
  zone?: string;
  available: boolean;
  kycStatus: KycStatus;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  services: ProviderService[];
  availability?: AvailabilityRule[];
  createdAt: string;
}

export interface ProviderStats {
  completedJobs: number;
  pendingOffers: number;
  activeMissions: number;
  totalEarnings: number;
  monthlyEarnings: number;
  rating: number;
  reviewCount: number;
  acceptanceRate: number;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  icon?: string;
  slug: string;
}

// ─── Service Request (DEMANDE) ───────────────────────────────────────────────

export type RequestStatus = 'OPEN' | 'QUOTED' | 'ACCEPTED' | 'CANCELLED' | 'EXPIRED';

export interface ServiceRequest {
  id: string;
  clientId: string;
  client: UserAccount;
  categoryId: string;
  category: Category;
  description: string;
  photoUrls: string[];
  city?: string;
  status: RequestStatus;
  offerCount: number;
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

export interface Booking {
  id: string;
  clientId: string;
  client: UserAccount;
  providerId: string;
  provider: ProviderAccount;
  offerId?: string;
  offer?: Offer;
  categoryId: string;
  category: Category;
  scheduledAt: string;
  slot?: string;
  estimatedHours?: number;
  totalAmount: number;
  platformFee: number;
  providerAmount: number;
  status: BookingStatus;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'NEW_REQUEST'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'OFFER_COUNTER'
  | 'MISSION_CONFIRMED'
  | 'MISSION_STARTED'
  | 'MISSION_COMPLETED'
  | 'PAYMENT_RECEIVED'
  | 'REVIEW_RECEIVED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

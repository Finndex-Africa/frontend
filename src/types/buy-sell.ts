// ─── Enums / Union Types ───────────────────────────────────────────────────

export type BuySellCategory = 'land' | 'house' | 'household_item';

export type BuySellStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type LandSubcategory = 'residential' | 'commercial' | 'beach' | 'farm';

export type HouseSubcategory = 'duplex' | 'apartment' | 'commercial';

export type HouseholdItemSubcategory =
  | 'furniture'
  | 'electronics'
  | 'kitchen_item'
  | 'office_equipment';

export type LandUnit = 'acres' | 'lots' | 'square_feet' | 'square_meters';

export type ItemCondition = 'new' | 'fairly_used';

// ─── Seller (populated on reads) ───────────────────────────────────────────

export interface BuySellSeller {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  avatar?: string | null;
  phone?: string;
  verified?: boolean;
  verificationStatus?: string;
  userType?: string;
}

// ─── Full Listing Schema ────────────────────────────────────────────────────

export interface BuySellListing {
  _id: string;
  title: string;
  description: string;
  category: BuySellCategory;
  price: number;
  location: string;
  images: string[];
  status: BuySellStatus;
  isPremium: boolean;
  sellerId: string | BuySellSeller;
  views: number;
  saves: number;
  rejectionReason?: string;
  approvedAt?: string;
  mapCoordinates?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
  /** Set by the API when the requesting user has bookmarked this listing */
  isBookmarked?: boolean;

  // ── Land fields ──────────────────────────────────────────────────────────
  landSubcategory?: LandSubcategory;
  landSize?: number;
  unit?: LandUnit;
  ownershipStatus?: string;
  sellerPhone?: string;
  whatsappNumber?: string;

  // ── House fields ─────────────────────────────────────────────────────────
  houseSubcategory?: HouseSubcategory;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  amenities?: Array<{ icon: string; label: string; desc?: string }>;

  // ── Household Item fields ─────────────────────────────────────────────────
  itemSubcategory?: HouseholdItemSubcategory;
  condition?: ItemCondition;
  warranty?: boolean;
  deliveryAvailable?: boolean;
}

// ─── Filters ───────────────────────────────────────────────────────────────

export interface BuySellFilters {
  page?: number;
  limit?: number;
  category?: BuySellCategory;
  status?: BuySellStatus;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  q?: string;
  sort?: string;
}

// ─── Create DTOs ───────────────────────────────────────────────────────────

interface CreateBuySellBase {
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  mapCoordinates?: { lat: number; lng: number };
}

export interface CreateLandDto extends CreateBuySellBase {
  category: 'land';
  landSize: number;
  unit: LandUnit;
  ownershipStatus: string;
  sellerPhone: string;
  landSubcategory?: LandSubcategory;
  whatsappNumber?: string;
}

export interface CreateHouseDto extends CreateBuySellBase {
  category: 'house';
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  houseSubcategory?: HouseSubcategory;
  amenities?: Array<{ icon: string; label: string }>;
}

export interface CreateHouseholdItemDto extends CreateBuySellBase {
  category: 'household_item';
  itemSubcategory: HouseholdItemSubcategory;
  condition: ItemCondition;
  warranty?: boolean;
  deliveryAvailable?: boolean;
}

export type CreateBuySellDto =
  | CreateLandDto
  | CreateHouseDto
  | CreateHouseholdItemDto;

export type UpdateBuySellDto = Partial<
  Omit<CreateBuySellDto, 'category'>
> & { category?: BuySellCategory };

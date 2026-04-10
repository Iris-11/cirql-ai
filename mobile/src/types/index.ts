export interface UserLocation {
    lat: number;
    lng: number;
    timestamp?: string;
}

export interface ProductImage {
    photo_id: string;
    url: string;
    label: string;
}

export interface Ownership {
    number_of_owners: number;
    last_purchase_date: string;
}

export interface ProductPassport {
    sku_code?: string;
    brand: string;
    name: string;
    category: string;
    age_in_months?: number;
    retail_price_usd?: number;
    materials?: string[];
    origin_country?: string;
    certifications?: string[];
    usage_history?: string;
    known_issues?: string;
    ownership?: Ownership;
    reference_images?: Record<string, string>;
}

export interface ConditionRequest {
    product_id?: string;
    submission_timestamp?: string;
    images: ProductImage[];
    passport: ProductPassport;
    grading_rubric?: Record<string, string>;
}

export interface EvidenceItem {
    claim: string;
    source: string;
}

export interface ConditionResponse {
    tier: string;
    score: number;
    evidence: EvidenceItem[];
    suggested_price: number;
    report_text: string;
    eligible_for_resale: boolean;
    ws_approved: boolean;
}

export interface ImpactMetrics {
    totalCo2SavedKg: number;
    dailyOffsetKg: number;
    wasteReductionPct: number;
    totalToolsSaved: number;
    activeCurators: number;
}

export interface RecentRehome {
    id: string;
    name: string;
    rehomedBy: string;
    image: string;
    condition: string;
    rating: number;
}

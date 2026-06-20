export interface ProductCategory {
    id: number;
    name: string;
    slug: string | null;
    description: string | null;
    colour: string;
    products_count?: number;
}
export interface Category {
    id: number; name: string; slug: string; description?: string;
    parent_id?: number | null; parent?: { id: number; name: string } | null;
    children?: Category[]; products_count?: number;
}
export interface UnitOfMeasure {
    id: number;
    name: string;
    abbreviation: string;
    type: string;
    is_base: boolean;
    conversion_factor: number;
    is_active: boolean;
    display_name: string;
}
export interface Supplier {
    id: number; name: string; contact_person?: string; email?: string;
    phone?: string; address?: string; is_active: boolean; created_at?: string;
    average_rating?: number | null;
}
export interface Warehouse { id: number; name: string; location?: string; is_active: boolean; stock_levels_count?: number; }
export interface StockLevelInfo {
    warehouse_id: number; warehouse_name?: string;
    quantity: string; reserved_quantity: string; available: number;
}
export interface ProductBundleItem {
    id: number;
    bundle_product_id: number;
    component_product_id: number;
    quantity: number;
    bundle_product?: Product;
    component_product?: Product;
}

export interface Product {
    id: number; sku: string; name: string; description?: string;
    category_id?: number | null;
    category?: ProductCategory | null;
    uom_id?: number | null; uom?: { id: number; name: string; abbreviation: string } | null;
    cost_price: string; sale_price: string; reorder_point: number;
    reorder_quantity?: number;
    preferred_supplier_id?: number | null;
    preferred_supplier?: { id: number; name: string } | null;
    is_active: boolean; stock_levels?: StockLevelInfo[]; total_quantity?: number;
    total_stock?: number; needs_reorder?: boolean; created_at?: string;
    is_bundle?: boolean;
    bundle_items?: ProductBundleItem[];
    stock_quantity?: number;
    stock_sufficient_for_bundle?: boolean;
}
export interface StockMovement {
    id: number; product_id: number; warehouse_id: number;
    type: 'in' | 'out' | 'transfer' | 'adjustment'; quantity: string;
    reference?: string; notes?: string; created_by?: number;
    product?: { id: number; name: string; sku: string };
    warehouse?: { id: number; name: string };
    creator?: { id: number; name: string }; created_at: string;
}
export interface PurchaseOrderItem {
    id: number; product_id: number; product_name?: string; product_sku?: string;
    quantity: string; unit_cost: string; received_quantity: string; line_total?: number;
}
export interface PurchaseOrder {
    id: number; status: 'draft' | 'submitted' | 'approved' | 'received' | 'cancelled';
    expected_date?: string | null; notes?: string; total?: number;
    supplier?: { id: number; name: string } | null;
    warehouse?: { id: number; name: string } | null;
    items?: PurchaseOrderItem[]; created_by?: string | null; created_at?: string;
}
export interface Paginator<T> {
    data: T[]; current_page: number; last_page: number;
    per_page: number; total: number; from: number; to: number;
    next_page_url: string | null; prev_page_url: string | null;
}
export interface WarehouseTransfer {
    id: number;
    product_id: number;
    product?: { id: number; name: string; sku: string };
    from_warehouse_id: number;
    from_warehouse?: { id: number; name: string };
    to_warehouse_id: number;
    to_warehouse?: { id: number; name: string };
    quantity: number;
    reference: string | null;
    notes: string | null;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
}

export interface StockAdjustmentItem {
    id: number;
    product_id: number;
    expected_quantity: number;
    actual_quantity: number;
    difference: number;
    product?: { id: number; name: string; sku: string };
}

export interface StockAdjustment {
    id: number;
    warehouse_id: number;
    reference: string;
    reason: 'count' | 'damage' | 'theft' | 'expiry' | 'correction' | 'other';
    status: 'draft' | 'confirmed' | 'cancelled';
    adjusted_by: number | null;
    confirmed_at: string | null;
    notes: string | null;
    warehouse?: { id: number; name: string };
    adjuster?: { id: number; name: string } | null;
    items?: StockAdjustmentItem[];
    created_at: string;
}

export interface PurchaseRequisitionItem {
    id: number;
    product_id: number | null;
    description: string;
    quantity: number;
    estimated_unit_cost: number;
    product?: { id: number; name: string; sku: string } | null;
}

export interface PurchaseRequisition {
    id: number;
    reference: string;
    requested_by: number | null;
    approved_by: number | null;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    needed_by: string | null;
    notes: string | null;
    rejection_reason: string | null;
    approved_at: string | null;
    total_estimated_cost: number;
    requester?: { id: number; name: string } | null;
    approver?: { id: number; name: string } | null;
    items?: PurchaseRequisitionItem[];
    created_at: string;
}

export interface Asset {
    id: number;
    name: string;
    asset_code: string | null;
    category: string | null;
    location: string | null;
    assigned_to_employee_id: number | null;
    purchase_date: string | null;
    purchase_cost: number | null;
    current_value: number | null;
    status: 'active' | 'inactive' | 'disposed' | 'under_maintenance';
    serial_number: string | null;
    notes: string | null;
    disposed_at: string | null;
    depreciation: number | null;
    maintenances_count?: number;
    assigned_employee?: { id: number; first_name: string; last_name: string } | null;
    maintenances?: AssetMaintenance[];
    created_at: string;
}

export interface AssetMaintenance {
    id: number;
    asset_id: number;
    scheduled_date: string;
    completed_date: string | null;
    type: 'routine' | 'repair' | 'inspection' | 'calibration';
    description: string | null;
    cost: number | null;
    performed_by: string | null;
    status: 'scheduled' | 'completed' | 'cancelled';
    asset?: Asset;
    created_at: string;
}

export interface WarehouseStock {
    id: number;
    warehouse_id: number;
    product_id: number;
    quantity: number;
    reorder_point: number | null;
    is_below_reorder_point: boolean;
    warehouse?: Warehouse;
    product?: Product;
}

export interface StockTransferItem {
    id: number;
    stock_transfer_id: number;
    product_id: number;
    quantity: number;
    product?: Product;
}

export interface StockTransfer {
    id: number;
    reference: string | null;
    from_warehouse_id: number;
    to_warehouse_id: number;
    status: 'draft' | 'in_transit' | 'completed' | 'cancelled';
    notes: string | null;
    transferred_at: string | null;
    items_count?: number;
    from_warehouse?: Warehouse;
    to_warehouse?: Warehouse;
    items?: StockTransferItem[];
    created_at: string;
}

export interface QcChecklistItem {
    id: number;
    qc_checklist_id: number;
    name: string;
    description: string | null;
    is_required: boolean;
    sort_order: number;
}

export interface QcChecklist {
    id: number;
    name: string;
    product_id: number | null;
    description: string | null;
    is_active: boolean;
    items_count?: number;
    product?: Product;
    items?: QcChecklistItem[];
    created_at: string;
}

export interface QcInspectionResult {
    id: number;
    qc_inspection_id: number;
    qc_checklist_item_id: number;
    result: 'pass' | 'fail' | 'na';
    notes: string | null;
    checklist_item?: QcChecklistItem;
}

export interface QcInspection {
    id: number;
    qc_checklist_id: number;
    product_id: number | null;
    inspector_id: number | null;
    batch_reference: string | null;
    status: 'pending' | 'in_progress' | 'passed' | 'failed';
    overall_result: 'pass' | 'fail' | 'conditional' | null;
    notes: string | null;
    inspected_at: string | null;
    pass_rate: number | null;
    checklist?: QcChecklist;
    product?: Product;
    inspector?: { id: number; name: string } | null;
    results?: QcInspectionResult[];
    created_at: string;
}

export interface CostingLayer {
    id: number;
    product_id: number;
    warehouse_id: number | null;
    costing_method: 'fifo' | 'avco';
    quantity_received: number;
    quantity_remaining: number;
    unit_cost: number;
    received_at: string;
    reference_type: string | null;
    reference_id: number | null;
    product?: Product;
    created_at: string;
}

export interface ProductCostSnapshot {
    id: number;
    product_id: number;
    costing_method: 'fifo' | 'avco';
    average_cost: number;
    fifo_cost: number;
    snapshot_date: string;
    total_quantity: number;
    total_value: number;
    product?: Product;
}

export interface DemandForecast {
    id: number;
    product_id: number;
    warehouse_id: number | null;
    forecast_date: string;
    forecasted_quantity: number;
    actual_quantity: number | null;
    method: 'moving_avg' | 'weighted_avg' | 'manual';
    confidence_score: number | null;
    notes: string | null;
    accuracy: number | null;
    product?: Product;
    created_at: string;
}

export interface ForecastAlert {
    id: number;
    product_id: number;
    alert_type: 'stockout_risk' | 'overstock' | 'reorder_point' | 'demand_spike';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    is_resolved: boolean;
    resolved_at: string | null;
    product?: Product;
    created_at: string;
}

export interface WarehouseZone {
    id: number;
    warehouse_id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    bins_count?: number;
    warehouse?: Warehouse;
}

export interface BinStockLocation {
    id: number;
    bin_id: number;
    product_id: number;
    quantity: number;
    lot_number: string | null;
    expiry_date: string | null;
    is_expired: boolean;
    product?: Product;
}

export interface WarehouseBin {
    id: number;
    warehouse_id: number;
    zone_id: number | null;
    code: string;
    name: string | null;
    bin_type: 'standard' | 'cold' | 'hazmat' | 'oversize';
    capacity: number | null;
    is_active: boolean;
    used_capacity: number;
    available_capacity: number | null;
    zone?: WarehouseZone | null;
    warehouse?: Warehouse;
    stock_locations?: BinStockLocation[];
    created_at: string;
}

export interface ProductAttribute {
    id: number;
    name: string;
    type: 'text' | 'select' | 'color' | 'number';
    options: string[] | null;
}

export interface ProductVariantValue {
    id: number;
    variant_id: number;
    attribute_id: number;
    value: string;
    attribute?: ProductAttribute;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    sku: string;
    name: string;
    price_adjustment: number;
    stock_quantity: number;
    is_active: boolean;
    effective_price: number;
    product?: Product;
    values?: ProductVariantValue[];
}

export interface VehicleLog {
    id: number;
    vehicle_id: number;
    log_type: 'trip' | 'refuel' | 'maintenance' | 'inspection';
    log_date: string;
    odometer_start: number | null;
    odometer_end: number | null;
    distance_km: number | null;
    fuel_litres: number | null;
    cost: number | null;
    driver_name: string | null;
    destination: string | null;
    purpose: string | null;
    notes: string | null;
    fuel_efficiency: number | null;
}

export interface Vehicle {
    id: number;
    registration: string;
    make: string;
    model: string;
    year: number | null;
    vin: string | null;
    colour: string | null;
    fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    odometer_km: number;
    status: 'available' | 'in_use' | 'maintenance' | 'retired';
    assigned_to_employee_id: number | null;
    insurance_expiry: string | null;
    registration_expiry: string | null;
    notes: string | null;
    is_insurance_expiring: boolean;
    is_registration_expiring: boolean;
    total_distance: number;
    assigned_employee?: { id: number; first_name: string; last_name: string } | null;
    logs?: VehicleLog[];
}

export interface SupplierReview {
    id: number;
    supplier_id: number;
    purchase_order_id: number | null;
    review_date: string;
    quality_score: number;
    delivery_score: number;
    communication_score: number;
    price_score: number;
    overall_score: number;
    notes: string | null;
    reviewed_by?: number;
    supplier?: Supplier;
}

export interface SupplierContract {
    id: number;
    supplier_id: number;
    contract_number: string | null;
    title: string;
    start_date: string;
    end_date: string | null;
    value: number | null;
    status: 'active' | 'expired' | 'terminated';
    payment_terms: string | null;
    is_active: boolean;
    is_expired: boolean;
    is_expiring: boolean;
    days_remaining: number | null;
    supplier?: Supplier;
}

export interface LotNumber {
    id: number;
    product_id: number;
    warehouse_id: number;
    lot_number: string;
    manufacture_date: string | null;
    expiry_date: string | null;
    quantity_received: number;
    quantity_remaining: number;
    status: 'active' | 'quarantine' | 'consumed' | 'expired';
    is_expired: boolean;
    is_expiring: boolean;
    notes: string | null;
    product?: Product;
    warehouse?: Warehouse;
}

export interface SerialNumber {
    id: number;
    product_id: number;
    warehouse_id: number;
    serial_number: string;
    status: 'in_stock' | 'sold' | 'returned' | 'scrapped';
    received_date: string | null;
    sold_date: string | null;
    lot_number_id: number | null;
    is_available: boolean;
    notes: string | null;
    product?: Product;
    warehouse?: Warehouse;
}

export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    product_id: number | null;
    description: string;
    quantity: number;
    unit_price: number;
    received_qty: number;
    line_total: number;
    is_fully_received: boolean;
    product?: Product;
}

export interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_id: number | null;
    requisition_id: number | null;
    status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';
    order_date: string;
    expected_date: string | null;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    notes: string | null;
    is_open: boolean;
    receiving_progress: number;
    supplier?: Supplier;
    items?: PurchaseOrderItem[];
}

export interface SalesOrderItem {
    id: number;
    sales_order_id: number;
    product_id: number | null;
    description: string;
    quantity: number;
    unit_price: number;
    shipped_qty: number;
    line_total: number;
    product?: Product;
}

export interface SalesOrder {
    id: number;
    so_number: string;
    customer_id: number | null;
    status: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    order_date: string;
    expected_date: string | null;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    notes: string | null;
    is_open: boolean;
    items?: SalesOrderItem[];
}

export interface PriceListItem {
    id: number;
    price_list_id: number;
    product_id: number;
    price: number;
    min_quantity: number;
    product?: Product;
}

export interface PriceList {
    id: number;
    name: string;
    currency: string;
    is_active: boolean;
    is_default: boolean;
    is_valid: boolean;
    item_count: number;
    valid_from: string | null;
    valid_to: string | null;
    notes: string | null;
    items?: PriceListItem[];
}

export interface CustomerDiscount {
    id: number;
    customer_id: number | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applies_to: 'all' | 'category' | 'product';
    applies_to_id: number | null;
    is_active: boolean;
    is_valid: boolean;
    valid_from: string | null;
    valid_to: string | null;
}

export interface CycleCountItem {
    id: number;
    product_id: number;
    system_qty: number;
    counted_qty: number | null;
    variance: number;
    is_counted: boolean;
}
export interface CycleCount {
    id: number;
    count_number: string;
    warehouse_id: number;
    count_date: string;
    status: string;
    total_variance: number;
    items_counted: number;
    items?: CycleCountItem[];
}

export interface ProductTag {
    id: number;
    name: string;
    color: string;
    description: string | null;
    is_active: boolean;
    product_count: number;
}

export interface ProductSubstitute {
    id: number;
    product_id: number;
    substitute_product_id: number;
    priority: number;
    is_bidirectional: boolean;
    is_active: boolean;
    notes: string | null;
    substitute_product?: Product;
}

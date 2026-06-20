<?php

use App\Modules\Inventory\Http\Controllers\InventoryDashboardController;

use App\Modules\Inventory\Http\Controllers\AssetController;
use App\Modules\Inventory\Http\Controllers\CostingController;
use App\Modules\Inventory\Http\Controllers\AssetMaintenanceController;
use App\Modules\Inventory\Http\Controllers\CategoryController;
use App\Modules\Inventory\Http\Controllers\ProductBundleController;
use App\Modules\Inventory\Http\Controllers\ProductCategoryController;
use App\Modules\Inventory\Http\Controllers\ProductController;
use App\Modules\Inventory\Http\Controllers\PurchaseOrderController;
use App\Modules\Inventory\Http\Controllers\PurchaseRequisitionController;
use App\Modules\Inventory\Http\Controllers\QcChecklistController;
use App\Modules\Inventory\Http\Controllers\QcInspectionController;
use App\Modules\Inventory\Http\Controllers\ReorderController;
use App\Modules\Inventory\Http\Controllers\StockAdjustmentController;
use App\Modules\Inventory\Http\Controllers\StockMovementController;
use App\Modules\Inventory\Http\Controllers\SupplierController;
use App\Modules\Inventory\Http\Controllers\WarehouseBinController;
use App\Modules\Inventory\Http\Controllers\WarehouseController;
use App\Modules\Inventory\Http\Controllers\WarehouseTransferController;
use App\Modules\Inventory\Http\Controllers\WarehouseStockController;
use App\Modules\Inventory\Http\Controllers\WarehouseZoneController;
use App\Modules\Inventory\Http\Controllers\DemandForecastController;
use App\Modules\Inventory\Http\Controllers\ProductAttributeController;
use App\Modules\Inventory\Http\Controllers\ProductVariantController;
use App\Modules\Inventory\Http\Controllers\StockTransferController;
use Illuminate\Support\Facades\Route;


Route::middleware(['web','auth','verified'])->prefix('inventory')->name('inventory.')->group(function() {
    Route::get('dashboard', [InventoryDashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {

    // Products
    Route::resource('products', ProductController::class)
        ->names('products');

    // Product Categories (flat, colour-coded)
    Route::resource('product-categories', ProductCategoryController::class)
        ->except(['create', 'edit', 'show'])
        ->names('product-categories');

    // Legacy Categories (hierarchical - index + inline CRUD via back())
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Warehouses (index + inline CRUD)
    Route::get('warehouses', [WarehouseController::class, 'index'])->name('warehouses.index');
    Route::post('warehouses', [WarehouseController::class, 'store'])->name('warehouses.store');
    Route::put('warehouses/{warehouse}', [WarehouseController::class, 'update'])->name('warehouses.update');
    Route::delete('warehouses/{warehouse}', [WarehouseController::class, 'destroy'])->name('warehouses.destroy');

    // Suppliers
    Route::resource('suppliers', SupplierController::class)
        ->except(['show'])
        ->names('suppliers');

    // Stock Movements
    Route::get('stock-movements', [StockMovementController::class, 'index'])->name('stock-movements.index');
    Route::post('stock-movements', [StockMovementController::class, 'store'])->name('stock-movements.store');

    // Purchase Orders
    Route::get('purchase-orders', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
    Route::get('purchase-orders/create', [PurchaseOrderController::class, 'create'])->name('purchase-orders.create');
    Route::post('purchase-orders', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
    Route::get('purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
    Route::get('purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'receiveForm'])->name('purchase-orders.receive-form');
    Route::patch('purchase-orders/{purchaseOrder}/transition', [PurchaseOrderController::class, 'transition'])->name('purchase-orders.transition');
    Route::post('purchase-orders/{purchaseOrder}/submit', [PurchaseOrderController::class, 'submit'])->name('purchase-orders.submit');
    Route::post('purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');
    Route::post('purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
    Route::post('purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel'])->name('purchase-orders.cancel');
    Route::post('purchase-orders/{purchaseOrder}/send',   [PurchaseOrderController::class, 'send'])->name('purchase-orders.send');
    Route::delete('purchase-orders/{purchaseOrder}',       [PurchaseOrderController::class, 'destroy'])->name('purchase-orders.destroy');

    // Reorder Suggestions
    Route::get('reorder', [ReorderController::class, 'index'])->name('reorder.index');
    Route::post('reorder/purchase-order', [ReorderController::class, 'createPurchaseOrder'])->name('reorder.create-po');

    // Warehouse Transfers
    Route::resource('warehouse-transfers', WarehouseTransferController::class)->only(['index', 'create', 'store']);

    // Stock Adjustments
    Route::resource('stock-adjustments', StockAdjustmentController::class)->except(['edit', 'update']);
    Route::post('stock-adjustments/{stockAdjustment}/confirm', [StockAdjustmentController::class, 'confirm'])->name('stock-adjustments.confirm');
    Route::post('stock-adjustments/{stockAdjustment}/cancel', [StockAdjustmentController::class, 'cancel'])->name('stock-adjustments.cancel');

    // Purchase Requisitions
    Route::resource('purchase-requisitions', PurchaseRequisitionController::class)->except(['edit', 'update']);
    Route::post('purchase-requisitions/{purchaseRequisition}/submit', [PurchaseRequisitionController::class, 'submit'])->name('purchase-requisitions.submit');
    Route::post('purchase-requisitions/{purchaseRequisition}/approve', [PurchaseRequisitionController::class, 'approve'])->name('purchase-requisitions.approve');
    Route::post('purchase-requisitions/{purchaseRequisition}/reject', [PurchaseRequisitionController::class, 'reject'])->name('purchase-requisitions.reject');

    // Assets
    Route::post('assets/{asset}/dispose', [AssetController::class, 'dispose'])->name('assets.dispose');
    Route::patch('assets/{asset}/assign', [AssetController::class, 'assign'])->name('assets.assign');
    Route::resource('assets', AssetController::class)->except(['edit', 'update']);

    // Asset Maintenances
    Route::patch('asset-maintenances/{assetMaintenance}/complete', [AssetMaintenanceController::class, 'complete'])->name('asset-maintenances.complete');
    Route::resource('asset-maintenances', AssetMaintenanceController::class)->except(['edit', 'update']);

    // Product Bundles
    Route::post('product-bundles/{productBundle}/items', [ProductBundleController::class, 'addItem'])->name('product-bundles.items.add');
    Route::delete('product-bundles/{productBundle}/items/{item}', [ProductBundleController::class, 'removeItem'])->name('product-bundles.items.remove');
    Route::resource('product-bundles', ProductBundleController::class)->only(['index', 'store', 'show', 'destroy']);

    // Warehouse Stock
    Route::resource('warehouse-stock', WarehouseStockController::class)->only(['index', 'show', 'update']);

    // Stock Transfers
    Route::post('stock-transfers/{stockTransfer}/complete', [StockTransferController::class, 'complete'])->name('stock-transfers.complete');
    Route::post('stock-transfers/{stockTransfer}/cancel',   [StockTransferController::class, 'cancel'])->name('stock-transfers.cancel');
    Route::resource('stock-transfers', StockTransferController::class)->except(['edit', 'update']);

    // QC Checklists
    Route::resource('qc-checklists', QcChecklistController::class)->except(['edit', 'update']);

    // QC Inspections
    Route::patch('qc-inspections/{qcInspection}/results/{result}', [QcInspectionController::class, 'updateResult'])->name('qc-inspections.results.update');
    Route::post('qc-inspections/{qcInspection}/complete', [QcInspectionController::class, 'complete'])->name('qc-inspections.complete');
    Route::resource('qc-inspections', QcInspectionController::class)->except(['edit', 'update']);

    // Inventory Costing
    Route::get('costing',                         [CostingController::class, 'index'])->name('costing.index');
    Route::get('costing/report',                  [CostingController::class, 'report'])->name('costing.report');
    Route::get('costing/{product}/layers',        [CostingController::class, 'layers'])->name('costing.layers');
    Route::post('costing/add-layer',              [CostingController::class, 'addLayer'])->name('costing.add-layer');
    Route::post('costing/snapshot',               [CostingController::class, 'snapshot'])->name('costing.snapshot');

    // Warehouse Zones
    Route::get('warehouse-zones',                    [WarehouseZoneController::class, 'index'])->name('warehouse-zones.index');
    Route::post('warehouse-zones',                   [WarehouseZoneController::class, 'store'])->name('warehouse-zones.store');
    Route::delete('warehouse-zones/{warehouseZone}', [WarehouseZoneController::class, 'destroy'])->name('warehouse-zones.destroy');

    // Warehouse Bins
    Route::post('warehouse-bins/{warehouseBin}/stock',              [WarehouseBinController::class, 'addStock'])->name('warehouse-bins.stock.add');
    Route::delete('warehouse-bins/{warehouseBin}/stock/{location}', [WarehouseBinController::class, 'removeStock'])->name('warehouse-bins.stock.remove');
    Route::resource('warehouse-bins', WarehouseBinController::class)->except(['edit', 'update']);

    // Product Attributes
    Route::resource('product-attributes', ProductAttributeController::class)->except(['show', 'create', 'edit']);

    // Product Variants
    Route::patch('product-variants/{productVariant}/adjust-stock', [ProductVariantController::class, 'adjustStock'])->name('product-variants.adjust-stock');
    Route::resource('product-variants', ProductVariantController::class)->except(['edit', 'update']);
});

// Demand Forecasting - custom actions BEFORE resource
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::get('demand-forecasts/alerts',                      [DemandForecastController::class, 'alerts'])->name('demand-forecasts.alerts');
    Route::post('demand-forecasts/generate',                   [DemandForecastController::class, 'generateForecast'])->name('demand-forecasts.generate');
    Route::post('demand-forecasts/alerts/{alert}/resolve',     [DemandForecastController::class, 'resolveAlert'])->name('demand-forecasts.alerts.resolve');
    Route::resource('demand-forecasts', DemandForecastController::class)->except(['edit']);
});

// Fleet/Vehicle Management - custom actions BEFORE resource
use App\Modules\Inventory\Http\Controllers\VehicleController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::patch('vehicles/{vehicle}/assign',   [VehicleController::class, 'assign'])->name('vehicles.assign');
    Route::patch('vehicles/{vehicle}/unassign', [VehicleController::class, 'unassign'])->name('vehicles.unassign');
    Route::post('vehicles/{vehicle}/retire',    [VehicleController::class, 'retire'])->name('vehicles.retire');
    Route::post('vehicles/{vehicle}/logs',      [VehicleController::class, 'addLog'])->name('vehicles.logs.add');
    Route::resource('vehicles', VehicleController::class)->except(['edit', 'update']);
});

// Supplier Performance Tracking
use App\Modules\Inventory\Http\Controllers\SupplierReviewController;
use App\Modules\Inventory\Http\Controllers\SupplierContractController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    // Supplier Reviews
    Route::resource('supplier-reviews', SupplierReviewController::class)->only(['index', 'store', 'destroy']);

    // Supplier Contracts - terminate BEFORE resource
    Route::post('supplier-contracts/{supplierContract}/terminate', [SupplierContractController::class, 'terminate'])->name('supplier-contracts.terminate');
    Route::resource('supplier-contracts', SupplierContractController::class)->only(['index', 'store', 'destroy']);

    // Supplier show
    Route::get('suppliers/{supplier}', [SupplierController::class, 'show'])->name('suppliers.show');
});

// Lot & Serial Number Tracking - custom actions BEFORE resource
use App\Modules\Inventory\Http\Controllers\LotNumberController;
use App\Modules\Inventory\Http\Controllers\SerialNumberController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    // Lot Numbers
    Route::post('lot-numbers/{lotNumber}/quarantine', [LotNumberController::class, 'quarantine'])->name('lot-numbers.quarantine');
    Route::post('lot-numbers/{lotNumber}/consume',    [LotNumberController::class, 'consume'])->name('lot-numbers.consume');
    Route::resource('lot-numbers', LotNumberController::class)->only(['index', 'store', 'show']);

    // Serial Numbers
    Route::post('serial-numbers/{serialNumber}/sell',  [SerialNumberController::class, 'sell'])->name('serial-numbers.sell');
    Route::post('serial-numbers/{serialNumber}/scrap', [SerialNumberController::class, 'scrap'])->name('serial-numbers.scrap');
    Route::resource('serial-numbers', SerialNumberController::class)->only(['index', 'store', 'show']);
});


// Sales Order Management — custom actions BEFORE resource
use App\Modules\Inventory\Http\Controllers\SalesOrderController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('sales-orders/{salesOrder}/confirm', [SalesOrderController::class, 'confirm'])->name('sales-orders.confirm');
    Route::post('sales-orders/{salesOrder}/ship',    [SalesOrderController::class, 'ship'])->name('sales-orders.ship');
    Route::post('sales-orders/{salesOrder}/deliver', [SalesOrderController::class, 'deliver'])->name('sales-orders.deliver');
    Route::post('sales-orders/{salesOrder}/cancel',  [SalesOrderController::class, 'cancel'])->name('sales-orders.cancel');
    Route::resource('sales-orders', SalesOrderController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
});

// Price Lists & Customer Discounts
use App\Modules\Inventory\Http\Controllers\PriceListController;
use App\Modules\Inventory\Http\Controllers\CustomerDiscountController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('price-lists/{priceList}/items',                    [PriceListController::class, 'addItem'])->name('price-lists.items.store');
    Route::delete('price-lists/{priceList}/items/{priceListItem}',  [PriceListController::class, 'removeItem'])->name('price-lists.items.destroy');
    Route::resource('price-lists', PriceListController::class)->only(['index', 'store', 'show', 'destroy']);
    Route::resource('customer-discounts', CustomerDiscountController::class)->only(['index', 'store', 'destroy']);
});

// Units of Measure
use App\Modules\Inventory\Http\Controllers\UnitOfMeasureController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::resource('units-of-measure', UnitOfMeasureController::class)->names('units-of-measure');
});

// Cycle Counts — custom actions BEFORE resource
use App\Modules\Inventory\Http\Controllers\CycleCountController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('cycle-counts/{cycleCount}/start',    [CycleCountController::class, 'start'])->name('cycle-counts.start');
    Route::post('cycle-counts/{cycleCount}/complete', [CycleCountController::class, 'complete'])->name('cycle-counts.complete');
    Route::post('cycle-counts/{cycleCount}/cancel',   [CycleCountController::class, 'cancel'])->name('cycle-counts.cancel');
    Route::post('cycle-counts/{cycleCount}/counts',   [CycleCountController::class, 'updateCounts'])->name('cycle-counts.counts.update');
    Route::resource('cycle-counts', CycleCountController::class)->names('cycle-counts');
});

// Product Tags
use App\Modules\Inventory\Http\Controllers\ProductTagController;
use App\Modules\Inventory\Http\Controllers\ProductTagAssignmentController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::resource('product-tags', ProductTagController::class)->except(['create', 'edit', 'show']);
    Route::post('products/{product}/tags',                  [ProductTagAssignmentController::class, 'attach'])->name('products.tags.attach');
    Route::delete('products/{product}/tags/{productTag}',   [ProductTagAssignmentController::class, 'detach'])->name('products.tags.detach');
});

// Product Substitutes (nested under products)
use App\Modules\Inventory\Http\Controllers\ProductSubstituteController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::get(   'products/{product}/substitutes',                        [ProductSubstituteController::class, 'index'])->name('products.substitutes.index');
    Route::post(  'products/{product}/substitutes',                        [ProductSubstituteController::class, 'store'])->name('products.substitutes.store');
    Route::patch( 'products/{product}/substitutes/{productSubstitute}',    [ProductSubstituteController::class, 'update'])->name('products.substitutes.update');
    Route::delete('products/{product}/substitutes/{productSubstitute}',    [ProductSubstituteController::class, 'destroy'])->name('products.substitutes.destroy');
});

// Backorders — custom actions BEFORE resource
use App\Modules\Inventory\Http\Controllers\BackorderController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('backorders/{backorder}/fulfill', [BackorderController::class, 'fulfill'])->name('backorders.fulfill');
    Route::post('backorders/{backorder}/cancel',  [BackorderController::class, 'cancel'])->name('backorders.cancel');
    Route::resource('backorders', BackorderController::class)->only(['index', 'store', 'show', 'destroy']);
});

// Reorder Rules
use App\Modules\Inventory\Http\Controllers\ReorderRuleController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('reorder-rules/{reorder_rule}/trigger', [ReorderRuleController::class, 'trigger'])->name('reorder-rules.trigger');
    Route::post('reorder-rules/{reorder_rule}/pause',   [ReorderRuleController::class, 'pause'])->name('reorder-rules.pause');
    Route::post('reorder-rules/{reorder_rule}/resume',  [ReorderRuleController::class, 'resume'])->name('reorder-rules.resume');
    Route::resource('reorder-rules', ReorderRuleController::class);
});

// Supplier Scorecards
use App\Modules\Inventory\Http\Controllers\SupplierScorecardController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('supplier-scorecards/{supplier_scorecard}/publish', [SupplierScorecardController::class, 'publish'])->name('supplier-scorecards.publish');
    Route::resource('supplier-scorecards', SupplierScorecardController::class);
});

// Quality Alerts
use App\Modules\Inventory\Http\Controllers\QualityAlertController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('quality-alerts/{quality_alert}/investigate', [QualityAlertController::class, 'investigate'])->name('quality-alerts.investigate');
    Route::post('quality-alerts/{quality_alert}/resolve',    [QualityAlertController::class, 'resolve'])->name('quality-alerts.resolve');
    Route::post('quality-alerts/{quality_alert}/close',      [QualityAlertController::class, 'close'])->name('quality-alerts.close');
    Route::resource('quality-alerts', QualityAlertController::class);
});

// Stock Reservations
use App\Modules\Inventory\Http\Controllers\StockReservationController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('stock-reservations/{stock_reservation}/fulfill', [StockReservationController::class, 'fulfill'])->name('stock-reservations.fulfill');
    Route::post('stock-reservations/{stock_reservation}/cancel',  [StockReservationController::class, 'cancel'])->name('stock-reservations.cancel');
    Route::post('stock-reservations/{stock_reservation}/expire',  [StockReservationController::class, 'expire'])->name('stock-reservations.expire');
    Route::resource('stock-reservations', StockReservationController::class);
});

// Purchase Requests
use App\Modules\Inventory\Http\Controllers\PurchaseRequestController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('purchase-requests/{purchase_request}/submit',       [PurchaseRequestController::class, 'submit'])->name('purchase-requests.submit');
    Route::post('purchase-requests/{purchase_request}/approve',      [PurchaseRequestController::class, 'approve'])->name('purchase-requests.approve');
    Route::post('purchase-requests/{purchase_request}/reject',       [PurchaseRequestController::class, 'reject'])->name('purchase-requests.reject');
    Route::post('purchase-requests/{purchase_request}/mark-ordered', [PurchaseRequestController::class, 'markOrdered'])->name('purchase-requests.mark-ordered');
    Route::post('purchase-requests/{purchase_request}/cancel',       [PurchaseRequestController::class, 'cancel'])->name('purchase-requests.cancel');
    Route::resource('purchase-requests', PurchaseRequestController::class);
});

// Goods Receipts
use App\Modules\Inventory\Http\Controllers\GoodsReceiptController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('goods-receipts/{goods_receipt}/confirm', [GoodsReceiptController::class, 'confirm'])->name('goods-receipts.confirm');
    Route::post('goods-receipts/{goods_receipt}/post',    [GoodsReceiptController::class, 'post'])->name('goods-receipts.post');
    Route::post('goods-receipts/{goods_receipt}/reject',  [GoodsReceiptController::class, 'reject'])->name('goods-receipts.reject');
    Route::resource('goods-receipts', GoodsReceiptController::class);
});

// Shipments
use App\Modules\Inventory\Http\Controllers\ShipmentController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('shipments/{shipment}/dispatch', [ShipmentController::class, 'dispatch'])->name('shipments.dispatch');
    Route::post('shipments/{shipment}/deliver',  [ShipmentController::class, 'deliver'])->name('shipments.deliver');
    Route::post('shipments/{shipment}/return',   [ShipmentController::class, 'returnShipment'])->name('shipments.return');
    Route::post('shipments/{shipment}/cancel',   [ShipmentController::class, 'cancel'])->name('shipments.cancel');
    Route::resource('shipments', ShipmentController::class);
});

// RMA Requests
use App\Modules\Inventory\Http\Controllers\RmaRequestController;
Route::middleware(['web', 'auth', 'verified'])->prefix('inventory')->name('inventory.')->group(function () {
    Route::post('rma-requests/{rma_request}/approve', [RmaRequestController::class, 'approve'])->name('rma-requests.approve');
    Route::post('rma-requests/{rma_request}/receive', [RmaRequestController::class, 'receive'])->name('rma-requests.receive');
    Route::post('rma-requests/{rma_request}/inspect', [RmaRequestController::class, 'inspect'])->name('rma-requests.inspect');
    Route::post('rma-requests/{rma_request}/close',   [RmaRequestController::class, 'close'])->name('rma-requests.close');
    Route::post('rma-requests/{rma_request}/reject',  [RmaRequestController::class, 'reject'])->name('rma-requests.reject');
    Route::resource('rma-requests', RmaRequestController::class);
});

// Warranties
use App\Modules\Inventory\Http\Controllers\ProductWarrantyController;
Route::middleware(['web','auth','verified'])->prefix('inventory')->name('inventory.')->group(function() {
    Route::resource('warranties', ProductWarrantyController::class);
});

// Warranty Claims
use App\Modules\Inventory\Http\Controllers\WarrantyClaimController;
Route::middleware(['web','auth','verified'])->prefix('inventory')->name('inventory.')->group(function() {
    Route::post('warranty-claims/{warranty_claim}/approve', [WarrantyClaimController::class, 'approve'])->name('warranty-claims.approve');
    Route::post('warranty-claims/{warranty_claim}/reject',  [WarrantyClaimController::class, 'reject'])->name('warranty-claims.reject');
    Route::post('warranty-claims/{warranty_claim}/resolve', [WarrantyClaimController::class, 'resolve'])->name('warranty-claims.resolve');
    Route::resource('warranty-claims', WarrantyClaimController::class)->except(['edit','update']);
});

// Put-Away Rules
use App\Modules\Inventory\Http\Controllers\PutAwayRuleController;
Route::middleware(['web','auth','verified'])->prefix('inventory')->name('inventory.')->group(function() {
    Route::post('put-away-rules/{put_away_rule}/activate',   [PutAwayRuleController::class,'activate'])->name('put-away-rules.activate');
    Route::post('put-away-rules/{put_away_rule}/deactivate', [PutAwayRuleController::class,'deactivate'])->name('put-away-rules.deactivate');
    Route::resource('put-away-rules', PutAwayRuleController::class);
});

// Stock Pickings
use App\Modules\Inventory\Http\Controllers\StockPickingController;
Route::middleware(['web','auth','verified'])->prefix('inventory')->name('inventory.')->group(function() {
    Route::post('stock-pickings/{stock_picking}/confirm',  [StockPickingController::class,'confirm'])->name('stock-pickings.confirm');
    Route::post('stock-pickings/{stock_picking}/start',    [StockPickingController::class,'startProcessing'])->name('stock-pickings.start');
    Route::post('stock-pickings/{stock_picking}/validate', [StockPickingController::class,'validate'])->name('stock-pickings.validate');
    Route::post('stock-pickings/{stock_picking}/cancel',   [StockPickingController::class,'cancel'])->name('stock-pickings.cancel');
    Route::resource('stock-pickings', StockPickingController::class);
});

// Replenishment Orders
use App\Modules\Inventory\Http\Controllers\ReplenishmentOrderController;
Route::middleware(['web','auth','verified'])->prefix('inventory')->name('inventory.')->group(function() {
    Route::post('replenishments/{replenishment}/confirm',  [ReplenishmentOrderController::class,'confirm'])->name('replenishments.confirm');
    Route::post('replenishments/{replenishment}/start',    [ReplenishmentOrderController::class,'markInProgress'])->name('replenishments.start');
    Route::post('replenishments/{replenishment}/complete', [ReplenishmentOrderController::class,'complete'])->name('replenishments.complete');
    Route::post('replenishments/{replenishment}/cancel',   [ReplenishmentOrderController::class,'cancel'])->name('replenishments.cancel');
    Route::resource('replenishments', ReplenishmentOrderController::class)->except(['edit','update']);
});

// Traceability
use App\Modules\Inventory\Http\Controllers\TraceabilityController;
Route::middleware(['web','auth','verified'])->prefix('inventory')->name('inventory.')->group(function() {
    Route::get('traceability', [TraceabilityController::class,'index'])->name('traceability.index');
});

// Inventory Reports
use App\Modules\Inventory\Http\Controllers\InventoryReportController;
Route::middleware(['web','auth','verified'])->prefix('inventory/reports')->name('inventory.reports.')->group(function() {
    Route::get('stock-valuation', [InventoryReportController::class, 'stockValuation'])->name('stock-valuation');
    Route::get('stock-movement',  [InventoryReportController::class, 'stockMovement'])->name('stock-movement');
    Route::get('low-stock',       [InventoryReportController::class, 'lowStock'])->name('low-stock');
    Route::get('abc-analysis',    [InventoryReportController::class, 'abcAnalysis'])->name('abc-analysis');
});

// Multi-Warehouse Overview
use App\Modules\Inventory\Http\Controllers\MultiWarehouseController;
Route::middleware(['web','auth','verified'])->prefix('inventory')->name('inventory.')->group(function() {
    Route::get('multi-warehouse', [MultiWarehouseController::class, 'index'])->name('multi-warehouse.index');
});

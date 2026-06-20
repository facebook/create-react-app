<?php

use App\Modules\Manufacturing\Http\Controllers\BomController;
use App\Modules\Manufacturing\Http\Controllers\ManufacturingDashboardController;
use App\Modules\Manufacturing\Http\Controllers\ManufacturingOrderController;
use App\Modules\Manufacturing\Http\Controllers\ManufacturingReportController;
use App\Modules\Manufacturing\Http\Controllers\SchedulingController;
use App\Modules\Manufacturing\Http\Controllers\ScrapController;
use App\Modules\Manufacturing\Http\Controllers\ShopFloorController;
use App\Modules\Manufacturing\Http\Controllers\WorkCenterController;
use App\Modules\Manufacturing\Http\Controllers\WorkOrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('manufacturing')->name('manufacturing.')->group(function () {
    // Dashboard
    Route::get('dashboard', [ManufacturingDashboardController::class, 'index'])->name('dashboard');

    // Bills of Materials
    Route::resource('boms', BomController::class);

    // Work Centers
    Route::resource('work-centers', WorkCenterController::class);

    // Manufacturing Orders — action routes BEFORE resource
    Route::post('manufacturing-orders/{manufacturing_order}/confirm',  [ManufacturingOrderController::class, 'confirm'])->name('manufacturing-orders.confirm');
    Route::post('manufacturing-orders/{manufacturing_order}/start',    [ManufacturingOrderController::class, 'start'])->name('manufacturing-orders.start');
    Route::post('manufacturing-orders/{manufacturing_order}/complete', [ManufacturingOrderController::class, 'complete'])->name('manufacturing-orders.complete');
    Route::post('manufacturing-orders/{manufacturing_order}/cancel',   [ManufacturingOrderController::class, 'cancel'])->name('manufacturing-orders.cancel');
    Route::resource('manufacturing-orders', ManufacturingOrderController::class);

    // Work Orders (nested) — action routes BEFORE resource
    Route::post('manufacturing-orders/{manufacturing_order}/work-orders/{work_order}/start',  [WorkOrderController::class, 'start'])->name('manufacturing-orders.work-orders.start');
    Route::post('manufacturing-orders/{manufacturing_order}/work-orders/{work_order}/finish', [WorkOrderController::class, 'finish'])->name('manufacturing-orders.work-orders.finish');
    Route::post('manufacturing-orders/{manufacturing_order}/work-orders/{work_order}/cancel', [WorkOrderController::class, 'cancel'])->name('manufacturing-orders.work-orders.cancel');
    Route::resource('manufacturing-orders.work-orders', WorkOrderController::class)->except(['show']);

    // Reports
    Route::get('reports/production-output', [ManufacturingReportController::class, 'productionOutput'])->name('reports.production-output');
    Route::get('reports/bom-cost',          [ManufacturingReportController::class, 'bomCost'])->name('reports.bom-cost');

    // Scheduling
    Route::get('scheduling/gantt', [SchedulingController::class, 'gantt'])->name('scheduling.gantt');
    Route::get('scheduling/capacity', [SchedulingController::class, 'capacity'])->name('scheduling.capacity');
    Route::post('scheduling', [SchedulingController::class, 'schedule'])->name('scheduling.store');
    Route::post('scheduling/{schedule}/confirm', [SchedulingController::class, 'confirm'])->name('scheduling.confirm');
    Route::post('scheduling/{schedule}/start', [SchedulingController::class, 'start'])->name('scheduling.start');
    Route::post('scheduling/{schedule}/complete', [SchedulingController::class, 'complete'])->name('scheduling.complete');
    Route::delete('scheduling/{schedule}', [SchedulingController::class, 'destroy'])->name('scheduling.destroy');
    Route::post('capacity', [SchedulingController::class, 'storeCapacity'])->name('capacity.store');
    Route::delete('capacity/{capacity}', [SchedulingController::class, 'destroyCapacity'])->name('capacity.destroy');

    // Scrap
    Route::get('scrap', [ScrapController::class, 'index'])->name('scrap.index');
    Route::post('scrap', [ScrapController::class, 'store'])->name('scrap.store');
    Route::delete('scrap/{scrapOrder}', [ScrapController::class, 'destroy'])->name('scrap.destroy');

    // Shop Floor
    Route::get('shop-floor', [ShopFloorController::class, 'index'])->name('shop-floor.index');
    Route::post('shop-floor/work-orders/{workOrder}/start', [ShopFloorController::class, 'startWorkOrder'])->name('shop-floor.work-orders.start');
    Route::post('shop-floor/work-orders/{workOrder}/finish', [ShopFloorController::class, 'finishWorkOrder'])->name('shop-floor.work-orders.finish');
});

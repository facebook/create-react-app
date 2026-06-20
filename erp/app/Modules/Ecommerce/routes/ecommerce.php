<?php

use App\Modules\Ecommerce\Http\Controllers\CartController;
use App\Modules\Ecommerce\Http\Controllers\CouponController;
use App\Modules\Ecommerce\Http\Controllers\EcommerceDashboardController;
use App\Modules\Ecommerce\Http\Controllers\ReviewController;
use App\Modules\Ecommerce\Http\Controllers\StoreCategoryController;
use App\Modules\Ecommerce\Http\Controllers\StoreOrderController;
use App\Modules\Ecommerce\Http\Controllers\StoreProductController;
use App\Modules\Ecommerce\Http\Controllers\StoreSettingsController;
use App\Modules\Ecommerce\Http\Controllers\StorefrontController;
use Illuminate\Support\Facades\Route;

// Admin routes (auth required)
Route::middleware(['web', 'auth', 'verified'])->prefix('ecommerce')->name('ecommerce.')->group(function () {
    Route::get('dashboard', [EcommerceDashboardController::class, 'index'])->name('dashboard');
    Route::get('settings', [StoreSettingsController::class, 'show'])->name('settings');
    Route::put('settings', [StoreSettingsController::class, 'update'])->name('settings.update');
    Route::resource('categories', StoreCategoryController::class)->except(['show', 'create', 'edit']);
    Route::resource('products', StoreProductController::class)->except(['show']);

    // Order actions BEFORE resource
    Route::post('orders/{order}/confirm',   [StoreOrderController::class, 'confirm'])->name('orders.confirm');
    Route::post('orders/{order}/mark-paid', [StoreOrderController::class, 'markPaid'])->name('orders.mark-paid');
    Route::post('orders/{order}/ship',      [StoreOrderController::class, 'ship'])->name('orders.ship');
    Route::post('orders/{order}/deliver',   [StoreOrderController::class, 'deliver'])->name('orders.deliver');
    Route::post('orders/{order}/cancel',    [StoreOrderController::class, 'cancel'])->name('orders.cancel');
    Route::resource('orders', StoreOrderController::class)->only(['index', 'show']);

    // Coupons
    Route::get('coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::post('coupons', [CouponController::class, 'store'])->name('coupons.store');
    Route::delete('coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');

    // Reviews
    Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::post('reviews/{review}/approve', [ReviewController::class, 'approve'])->name('reviews.approve');
    Route::delete('reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
});

// Public storefront (no auth)
Route::middleware('web')->prefix('store')->name('store.')->group(function () {
    Route::get('{slug}',                         [StorefrontController::class, 'index'])->name('index');
    Route::get('{slug}/products',                [StorefrontController::class, 'products'])->name('products');
    Route::get('{slug}/products/{storeProduct}', [StorefrontController::class, 'product'])->name('product');
    Route::get('{slug}/checkout',                [StorefrontController::class, 'checkout'])->name('checkout');
    Route::post('{slug}/checkout',               [StorefrontController::class, 'placeOrder'])->name('place-order');

    // Cart
    Route::prefix('{slug}')->group(function () {
        Route::get('cart', [CartController::class, 'index'])->name('cart');
        Route::post('cart', [CartController::class, 'add'])->name('cart.add');
        Route::patch('cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
        Route::delete('cart/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');
        Route::delete('cart', [CartController::class, 'clear'])->name('cart.clear');
        Route::post('coupon/validate', [CouponController::class, 'validate'])->name('coupon.validate');
        Route::post('products/{storeProduct}/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    });
});

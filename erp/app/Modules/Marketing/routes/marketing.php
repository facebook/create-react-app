<?php

use App\Modules\Marketing\Http\Controllers\EmailCampaignController;
use App\Modules\Marketing\Http\Controllers\MailingListController;
use App\Modules\Marketing\Http\Controllers\MarketingAnalyticsController;
use App\Modules\Marketing\Http\Controllers\MarketingDashboardController;
use App\Modules\Marketing\Http\Controllers\SubscriberController;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->prefix('marketing')->name('marketing.')->group(function () {
    Route::get('dashboard', [MarketingDashboardController::class, 'index'])->name('dashboard');

    Route::post('mailing-lists/{mailing_list}/add-subscriber', [MailingListController::class, 'addSubscriber'])->name('mailing-lists.add-subscriber');
    Route::delete('mailing-lists/{mailing_list}/subscribers/{subscriber}', [MailingListController::class, 'removeSubscriber'])->name('mailing-lists.remove-subscriber');
    Route::resource('mailing-lists', MailingListController::class);

    Route::post('subscribers/{subscriber}/unsubscribe', [SubscriberController::class, 'unsubscribe'])->name('subscribers.unsubscribe');
    Route::post('subscribers/import', [SubscriberController::class, 'import'])->name('subscribers.import');
    Route::resource('subscribers', SubscriberController::class)->only(['index', 'store', 'destroy']);

    Route::post('campaigns/{campaign}/send', [EmailCampaignController::class, 'send'])->name('campaigns.send');
    Route::post('campaigns/{campaign}/cancel', [EmailCampaignController::class, 'cancel'])->name('campaigns.cancel');
    Route::resource('campaigns', EmailCampaignController::class);

    // Analytics
    Route::get('analytics', [MarketingAnalyticsController::class, 'index'])->name('analytics');
    Route::get('analytics/{campaign}/stats', [MarketingAnalyticsController::class, 'campaignStats'])->name('analytics.campaign');
    Route::post('analytics/track', [MarketingAnalyticsController::class, 'trackEvent'])->name('analytics.track');
    Route::post('campaigns/{campaign}/ab-variants', [MarketingAnalyticsController::class, 'storeAbVariant'])->name('campaigns.ab-variants.store');
    Route::post('campaigns/{campaign}/ab-variants/{variant}/winner', [MarketingAnalyticsController::class, 'declareWinner'])->name('campaigns.ab-variants.winner');
});

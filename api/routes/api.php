<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AllocationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EligibilityController;
use App\Http\Controllers\Api\KeyController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\PriceController;
use App\Http\Controllers\Api\RedemptionController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::get('keys/voucher-public', [KeyController::class, 'voucherPublicKey']);

Route::get('prices', [PriceController::class, 'index']);
Route::get('prices/{price}/history', [PriceController::class, 'history']);

Route::middleware('auth:api')->group(function (): void {
    Route::get('locations', [LocationController::class, 'index']);
    Route::get('locations/{location}', [LocationController::class, 'show']);

    Route::middleware('role:citizen')->group(function (): void {
        Route::post('eligibility/verify', [EligibilityController::class, 'verify']);

        Route::get('allocations', [AllocationController::class, 'index']);
        Route::post('allocations', [AllocationController::class, 'store']);
        Route::delete('allocations/{allocation}', [AllocationController::class, 'destroy']);
    });

    Route::middleware('role:merchant')->group(function (): void {
        Route::post('redemptions', [RedemptionController::class, 'store']);
        Route::post('redemptions/batch', [RedemptionController::class, 'batch']);
    });

    Route::middleware('role:lgu_admin')->group(function (): void {
        Route::get('dashboard/heatmap', [DashboardController::class, 'heatmap']);
        Route::get('dashboard/stats', [DashboardController::class, 'stats']);

        Route::post('prices', [PriceController::class, 'store']);
        Route::put('prices/{price}', [PriceController::class, 'update']);
    });
});

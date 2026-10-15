<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Registered under the "/api" prefix (see bootstrap/app.php).
|
| Only the connectivity health check lives here for now. Business endpoints
| will be added from the existing API collection; nothing is guessed ahead
| of that. When the collection arrives, group the routes by domain and keep
| the version prefix (for example "/api/v1") consistent with the existing
| service.
|
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => config('app.name'),
        'time' => now()->toIso8601String(),
    ]);
})->name('api.health');

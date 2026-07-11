<?php

namespace App\Providers;

use App\Models\User;
use App\Services\Auth\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->app->rebinding('request', function ($app): void {
            $app['auth']->forgetGuards();
        });

        Auth::viaRequest('jwt', function (Request $request): ?User {
            $token = $request->bearerToken();

            if ($token === null) {
                return null;
            }

            $userId = app(JwtService::class)->subjectFrom($token);

            if ($userId === null) {
                return null;
            }

            return User::find($userId);
        });
    }
}

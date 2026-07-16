<?php

declare(strict_types=1);

use App\Models\Barangay;
use App\Services\Hazard\ProvinceLocator;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barangays', function (Blueprint $table): void {
            $table->string('province_code')->nullable()->index()->after('city');
        });

        $locator = new ProvinceLocator();

        Barangay::query()
            ->select(['id', 'city', 'latitude', 'longitude'])
            ->each(function (Barangay $barangay) use ($locator): void {
                $code = $locator->forCity(
                    (string) $barangay->city,
                    $barangay->latitude !== null ? (float) $barangay->latitude : null,
                    $barangay->longitude !== null ? (float) $barangay->longitude : null,
                );

                if ($code === null) {
                    return;
                }

                $barangay->newQuery()->whereKey($barangay->getKey())->update(['province_code' => $code]);
            });
    }

    public function down(): void
    {
        Schema::table('barangays', function (Blueprint $table): void {
            $table->dropColumn('province_code');
        });
    }
};

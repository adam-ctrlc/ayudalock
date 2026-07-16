<?php

declare(strict_types=1);

use App\Models\Province;
use App\Services\Energy\GridLocator;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('provinces', function (Blueprint $table): void {
            $table->string('grid')->nullable()->index()->after('region');
        });

        $locator = new GridLocator();

        Province::query()->select(['id', 'code'])->each(function (Province $province) use ($locator): void {
            $province->newQuery()
                ->whereKey($province->getKey())
                ->update(['grid' => $locator->forProvince($province->code)->value]);
        });
    }

    public function down(): void
    {
        Schema::table('provinces', function (Blueprint $table): void {
            $table->dropColumn('grid');
        });
    }
};

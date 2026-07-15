<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('provinces', function (Blueprint $table): void {
            $table->decimal('temperature', 5, 2)->nullable();
            $table->decimal('precipitation', 6, 2)->nullable();
            $table->unsignedSmallInteger('weather_code')->nullable();
            $table->string('weather_description')->nullable();
            $table->decimal('wind_speed', 6, 2)->nullable();
            $table->timestamp('weather_updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('provinces', function (Blueprint $table): void {
            $table->dropColumn([
                'temperature',
                'precipitation',
                'weather_code',
                'weather_description',
                'wind_speed',
                'weather_updated_at',
            ]);
        });
    }
};

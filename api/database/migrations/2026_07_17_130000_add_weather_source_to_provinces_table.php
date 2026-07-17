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
            $table->string('weather_source')->default('open-meteo')->index();
            $table->string('weather_note')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('provinces', function (Blueprint $table): void {
            $table->dropColumn(['weather_source', 'weather_note']);
        });
    }
};

<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hazard_events', function (Blueprint $table): void {
            $table->id();
            $table->string('type')->index();
            $table->string('source')->default('manual');
            $table->string('external_id')->nullable()->unique();
            $table->string('title');
            $table->string('place')->nullable();
            $table->decimal('magnitude', 4, 2)->nullable();
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->string('province_code')->nullable()->index();
            $table->unsignedBigInteger('affected_people')->nullable();
            $table->unsignedInteger('severity')->default(0);
            $table->timestamp('occurred_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hazard_events');
    }
};

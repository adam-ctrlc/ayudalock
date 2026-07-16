<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('power_interruptions', function (Blueprint $table): void {
            $table->id();
            $table->string('type')->index();
            $table->string('status')->default('announced')->index();
            $table->string('utility');
            $table->string('province_code')->nullable()->index();
            $table->foreignId('barangay_id')->nullable()->constrained()->nullOnDelete();
            $table->json('areas')->nullable();
            $table->unsignedBigInteger('households_affected')->nullable();
            $table->string('source')->default('manual');
            $table->string('external_id')->nullable()->unique();
            $table->dateTime('starts_at')->index();
            $table->dateTime('ends_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('power_interruptions');
    }
};

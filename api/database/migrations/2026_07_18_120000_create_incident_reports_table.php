<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->index();
            $table->string('status')->default('submitted')->index();
            $table->string('title');
            $table->text('description');
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->string('province_code')->nullable()->index();
            $table->foreignId('barangay_id')->nullable()->constrained()->nullOnDelete();
            $table->string('location_source')->default('manual_province');
            $table->unsignedInteger('accuracy_meters')->nullable();
            $table->unsignedInteger('severity')->nullable();
            $table->text('photo_thumbnail')->nullable();
            $table->foreignId('hazard_event_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_reports');
    }
};

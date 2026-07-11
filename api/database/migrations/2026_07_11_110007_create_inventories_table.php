<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('commodity_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity_available', 14, 2)->default(0);
            $table->decimal('quantity_locked', 14, 2)->default(0);
            $table->timestamps();

            $table->unique(['location_id', 'commodity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};

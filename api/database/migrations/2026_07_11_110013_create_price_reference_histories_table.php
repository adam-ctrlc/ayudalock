<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_reference_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('price_reference_id')->constrained()->cascadeOnDelete();
            $table->decimal('value', 12, 2);
            $table->decimal('previous_value', 12, 2)->nullable();
            $table->date('effective_date');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_reference_histories');
    }
};

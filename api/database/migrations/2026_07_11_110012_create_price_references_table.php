<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_references', function (Blueprint $table) {
            $table->id();
            $table->string('category')->index();
            $table->string('name');
            $table->decimal('value', 12, 2);
            $table->string('unit');
            $table->string('region')->default('NCR')->index();
            $table->string('source')->nullable();
            $table->date('effective_date');
            $table->decimal('previous_value', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_references');
    }
};

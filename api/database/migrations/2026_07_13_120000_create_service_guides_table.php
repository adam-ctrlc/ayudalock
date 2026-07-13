<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_guides', function (Blueprint $table): void {
            $table->id();
            $table->string('category')->index();
            $table->string('agency');
            $table->string('title');
            $table->text('summary');
            $table->json('requirements');
            $table->json('steps');
            $table->text('where_to_go');
            $table->string('fees')->nullable();
            $table->text('notes')->nullable();
            $table->string('source_url')->nullable();
            $table->date('effective_date')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_guides');
    }
};

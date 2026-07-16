<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grid_statuses', function (Blueprint $table): void {
            $table->id();
            $table->string('island')->index();
            $table->string('level')->default('normal');
            $table->unsignedInteger('demand_mw')->nullable();
            $table->unsignedInteger('capacity_mw')->nullable();
            $table->integer('reserve_mw')->nullable();
            $table->string('source')->default('manual');
            $table->string('note')->nullable();
            $table->dateTime('observed_at')->index();
            $table->timestamps();

            $table->unique(['island', 'observed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grid_statuses');
    }
};

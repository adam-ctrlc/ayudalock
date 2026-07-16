<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table): void {
            $table->boolean('has_generator')->default(false)->after('is_active');
            $table->string('power_status')->default('online')->index()->after('has_generator');
            $table->timestamp('power_status_updated_at')->nullable()->after('power_status');
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table): void {
            $table->dropColumn(['has_generator', 'power_status', 'power_status_updated_at']);
        });
    }
};

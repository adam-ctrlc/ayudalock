<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('allocation_id')->constrained()->cascadeOnDelete();
            $table->string('token', 512)->unique();
            $table->text('qr_payload');
            $table->string('sms_code', 12)->unique();
            $table->timestamp('expires_at')->index();
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};

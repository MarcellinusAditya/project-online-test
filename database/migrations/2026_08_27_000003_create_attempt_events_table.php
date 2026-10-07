<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attempt_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained()->cascadeOnDelete();
            $table->string('event_type');
            $table->json('event_data')->nullable();
            $table->timestamps();

            $table->index(['attempt_id', 'event_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempt_events');
    }
};

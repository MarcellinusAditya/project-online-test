<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();

            // Test defaults
            $table->unsignedSmallInteger('default_duration_minutes')->default(60);
            $table->unsignedTinyInteger('default_passing_score')->default(70);
            $table->boolean('default_show_result')->default(true);
            $table->boolean('auto_publish')->default(false);

            // Appearance
            $table->string('theme', 10)->default('system');

            // Notifications
            $table->boolean('notify_new_attempt')->default(true);
            $table->boolean('notify_daily_summary')->default(false);
            $table->boolean('notify_weekly_report')->default(false);

            // Integrations
            $table->string('webhook_url', 500)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};

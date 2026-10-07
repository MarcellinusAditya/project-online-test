<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_id')->constrained()->cascadeOnDelete();
            $table->string('participant_name');
            $table->string('participant_identifier')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->enum('status', ['in_progress', 'submitted', 'expired', 'grading'])->default('in_progress');
            $table->integer('score')->nullable();
            $table->integer('total_correct')->nullable();
            $table->integer('total_wrong')->nullable();
            $table->integer('total_unanswered')->nullable();
            $table->integer('time_spent_seconds')->nullable();
            $table->text('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['test_id', 'status']);
            $table->index(['test_id', 'participant_identifier']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attempts');
    }
};

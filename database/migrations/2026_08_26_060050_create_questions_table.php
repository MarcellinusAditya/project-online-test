<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_bank_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->string('type')->default('multiple_choice');
            $table->integer('points')->default(1);
            $table->text('explanation')->nullable();
            $table->timestamps();

            $table->index(['question_bank_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};

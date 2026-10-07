<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->string('key', 10);
            $table->text('text');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();

            $table->index(['question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_options');
    }
};

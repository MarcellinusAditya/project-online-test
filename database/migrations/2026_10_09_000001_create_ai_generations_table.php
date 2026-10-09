<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_generations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('test_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source_filename');
            $table->string('source_path');
            $table->string('status')->default('pending');
            $table->unsignedTinyInteger('question_count')->default(5);
            $table->string('question_type')->default('multiple_choice');
            $table->string('difficulty')->default('medium');
            $table->longText('extracted_text')->nullable();
            $table->json('draft_questions')->nullable();
            $table->text('error_message')->nullable();
            $table->string('provider')->default('auto');
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_generations');
    }
};

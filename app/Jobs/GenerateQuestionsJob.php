<?php

namespace App\Jobs;

use App\Models\AiGeneration;
use App\Services\Ai\ExamTextParser;
use App\Services\Ai\HeuristicFallbackGenerator;
use App\Services\Ai\OpenAiCompatibleGenerator;
use App\Services\Ai\PdfTextExtractor;
use App\Services\Ai\SourceTypeDetector;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GenerateQuestionsJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 300;

    public function __construct(public int $generationId) {}

    public function handle(PdfTextExtractor $extractor): void
    {
        $generation = AiGeneration::find($this->generationId);

        if (! $generation || $generation->isFinished()) {
            return;
        }

        $generation->update(['status' => AiGeneration::STATUS_PROCESSING]);

        try {
            $absolutePath = Storage::disk('local')->path($generation->source_path);
            $text = $extractor->extract($absolutePath);

            if (mb_strlen($text) < 100) {
                throw new \RuntimeException('Extracted text is too short to generate questions.');
            }

            $chunks = $extractor->chunk($text);
            $chunk = $chunks[0];
            $mode = SourceTypeDetector::detect($text);
            $isExam = $mode === SourceTypeDetector::MODE_EXAM_CONVERT;

            $provider = 'heuristic-fallback';
            $drafts = [];

            if (! empty(config('services.ai.key'))) {
                try {
                    $ai = new OpenAiCompatibleGenerator;
                    $drafts = $isExam
                        ? $ai->convert(
                            $chunk,
                            $generation->question_count,
                            $generation->question_type,
                            $generation->difficulty
                        )
                        : $ai->generate(
                            $chunk,
                            $generation->question_count,
                            $generation->question_type,
                            $generation->difficulty
                        );
                    $provider = $ai->name().($isExam ? ':exam-convert' : '');
                } catch (\Throwable $e) {
                    Log::warning('AI provider failed, using heuristic fallback', [
                        'generation_id' => $generation->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            if ($drafts === [] && $isExam) {
                try {
                    $drafts = ExamTextParser::parse(
                        $text,
                        $generation->question_count,
                        $generation->question_type,
                        $generation->difficulty
                    );
                    $provider = 'exam-parser';
                } catch (\Throwable $e) {
                    Log::warning('Exam parser failed, using heuristic fallback', [
                        'generation_id' => $generation->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            if ($drafts === []) {
                $drafts = (new HeuristicFallbackGenerator)->generate(
                    $chunk,
                    $generation->question_count,
                    $generation->question_type,
                    $generation->difficulty
                );
                $provider = (new HeuristicFallbackGenerator)->name();
            }

            $generation->update([
                'status' => AiGeneration::STATUS_COMPLETED,
                'source_mode' => $mode,
                'extracted_text' => mb_substr($text, 0, 60000),
                'draft_questions' => $drafts,
                'provider' => $provider,
                'error_message' => null,
            ]);
        } catch (\Throwable $e) {
            Log::error('AI question generation failed', [
                'generation_id' => $generation->id,
                'error' => $e->getMessage(),
            ]);

            $generation->update([
                'status' => AiGeneration::STATUS_FAILED,
                'error_message' => mb_substr($e->getMessage(), 0, 1000),
            ]);
        }
    }
}

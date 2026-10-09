<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAiCompatibleGenerator implements QuestionGeneratorInterface
{
    public function name(): string
    {
        return 'openai-compatible';
    }

    public function generate(string $sourceText, int $count, string $questionType, string $difficulty): array
    {
        return $this->runPrompt($sourceText, $count, $questionType, $difficulty, false);
    }

    /**
     * Convert an existing exam sheet verbatim: copy each numbered question and
     * its options as-is (same language), ignore headers/identity lines, and
     * randomly distribute the correct-answer position.
     */
    public function convert(string $sourceText, int $count, string $questionType, string $difficulty): array
    {
        return $this->runPrompt($sourceText, $count, $questionType, $difficulty, true);
    }

    private function runPrompt(string $sourceText, int $count, string $questionType, string $difficulty, bool $convertMode): array
    {
        $apiKey = config('services.ai.key');
        $baseUrl = rtrim((string) config('services.ai.base', 'https://api.openai.com/v1'), '/');
        $model = (string) config('services.ai.model', 'gpt-4o-mini');

        if (empty($apiKey)) {
            throw new \RuntimeException('AI API key is not configured.');
        }

        $chunk = mb_substr(preg_replace('/\s+/', ' ', $sourceText), 0, 12000);

        if ($convertMode) {
            $prompt = "You are converting an EXISTING exam sheet into structured data. Copy each numbered "
                ."question and its answer options VERBATIM in the original language (do not translate, "
                ."do not paraphrase, do NOT turn them into fill-in-the-blank cloze statements, and never add "
                ."prefixes like \"Complete the statement\"). IGNORE all header/identity/admin lines such as: "
                ."student name, class, attendance number, day/date, score fields, school name, general "
                ."instructions, and document titles. Convert at most {$count} question(s) of type {$questionType}. "
                ."IMPORTANT: distribute the correct-answer position RANDOMLY across A, B, C, D — never put "
                ."every correct answer on A. "
                ."Respond with a single valid JSON object {\"questions\": [...]} (no markdown, no commentary). "
                ."Each item must have: \"question\" (string, exact original text), \"type\" (\"multiple_choice\" "
                ."or \"essay\"), \"points\" (integer 1-10), \"explanation\" (string or null), and \"options\" "
                ."(array of the original 4-5 options with \"key\" A-E, \"text\" exact original text, "
                ."\"is_correct\" boolean; exactly one true for multiple_choice, empty array for essay). "
                ."If the source marks no correct answer, infer the single most plausible one.\n\n"
                ."EXAM SHEET TEXT:\n{$chunk}";
        } else {
            $prompt = "You are a test-question author. Based ONLY on the study material below, "
                ."generate exactly {$count} {$questionType} question(s) at {$difficulty} difficulty. "
                ."Write natural questions in the SAME language as the material (do NOT add prefixes like "
                ."\"Complete the statement\"). IMPORTANT: distribute the correct-answer position RANDOMLY "
                ."across A, B, C, D — never put every correct answer on A. "
                ."Respond with a single valid JSON object {\"questions\": [...]} (no markdown, no commentary). "
                ."Each item must have: "
                ."\"question\" (string), \"type\" (\"multiple_choice\" or \"essay\"), \"points\" (integer 1-10), "
                ."\"explanation\" (string or null), and \"options\" (array of 4 objects with \"key\" A-D, \"text\", "
                ."\"is_correct\" boolean; exactly one true for multiple_choice, empty array for essay).\n\n"
                ."STUDY MATERIAL:\n{$chunk}";
        }

        $response = Http::timeout((int) config('services.ai.timeout', 90))
            ->withToken($apiKey)
            ->post($baseUrl.'/chat/completions', [
                'model' => $model,
                'temperature' => 0.4,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => 'You output only valid JSON. Wrap the array as {"questions": [...]}.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

        if (! $response->successful()) {
            Log::warning('AI generation request failed', [
                'status' => $response->status(),
                'body' => mb_substr((string) $response->body(), 0, 1000),
            ]);
            throw new \RuntimeException('AI provider returned HTTP '.$response->status());
        }

        $content = $response->json('choices.0.message.content', '');

        return QuestionDraftValidator::validate($content, $count, $questionType);
    }
}

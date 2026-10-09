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
        $apiKey = config('services.ai.key');
        $baseUrl = rtrim((string) config('services.ai.base', 'https://api.openai.com/v1'), '/');
        $model = (string) config('services.ai.model', 'gpt-4o-mini');

        if (empty($apiKey)) {
            throw new \RuntimeException('AI API key is not configured.');
        }

        $chunk = mb_substr(preg_replace('/\s+/', ' ', $sourceText), 0, 12000);

        $prompt = "You are a test-question author. Based ONLY on the study material below, "
            ."generate exactly {$count} {$questionType} question(s) at {$difficulty} difficulty. "
            ."Respond with a single valid JSON array (no markdown, no commentary). Each item must have: "
            ."\"question\" (string), \"type\" (\"multiple_choice\" or \"essay\"), \"points\" (integer 1-10), "
            ."\"explanation\" (string or null), and \"options\" (array of 4 objects with \"key\" A-D, \"text\", "
            ."\"is_correct\" boolean; exactly one true for multiple_choice, empty array for essay).\n\n"
            ."STUDY MATERIAL:\n{$chunk}";

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

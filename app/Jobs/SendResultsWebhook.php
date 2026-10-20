<?php

namespace App\Jobs;

use App\Models\Attempt;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendResultsWebhook implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 10;

    public function __construct(protected Attempt $attempt)
    {
    }

    public function handle(): void
    {
        $webhookUrl = $this->attempt->test->user?->settings?->webhook_url;

        if (! $webhookUrl) {
            return;
        }

        $attempt = $this->attempt->loadMissing(['test', 'answers.question']);

        $payload = [
            'event' => 'attempt.submitted',
            'attempt_id' => $attempt->id,
            'test' => [
                'id' => $attempt->test->id,
                'title' => $attempt->test->title,
                'passing_score' => $attempt->test->passing_score,
            ],
            'participant' => [
                'name' => $attempt->participant_name,
                'identifier' => $attempt->participant_identifier,
            ],
            'result' => [
                'status' => $attempt->status->value,
                'score' => $attempt->score,
                'passed' => $attempt->score !== null && $attempt->score >= $attempt->test->passing_score,
                'total_correct' => $attempt->total_correct,
                'total_wrong' => $attempt->total_wrong,
                'total_unanswered' => $attempt->total_unanswered,
                'time_spent_seconds' => $attempt->time_spent_seconds,
                'submitted_at' => $attempt->submitted_at?->toIso8601String(),
            ],
        ];

        $body = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $signature = hash_hmac('sha256', $body, config('app.key'));

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-TestPro-Signature' => $signature,
        ])->timeout(10)->withBody($body, 'application/json')->post($webhookUrl);

        if ($response->failed()) {
            Log::warning('Results webhook failed', [
                'attempt_id' => $attempt->id,
                'status' => $response->status(),
            ]);

            $response->throw();
        }
    }
}

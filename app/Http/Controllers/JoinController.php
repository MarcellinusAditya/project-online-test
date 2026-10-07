<?php

namespace App\Http\Controllers;

use App\Models\Test;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JoinController extends Controller
{
    public function show(Request $request)
    {
        $token = $request->query('token');

        if ($token) {
            return $this->validateToken($token);
        }

        return Inertia::render('Join/Index');
    }

    public function validateToken(string $token)
    {
        $test = Test::where('token', $token)->first();

        if (! $test) {
            return Inertia::render('Join/Index', [
                'error' => 'Invalid test token. Please check the token and try again.',
            ]);
        }

        if (! $test->isPublished()) {
            return Inertia::render('Join/Index', [
                'error' => 'This test is not available yet.',
                'test' => [
                    'id' => $test->id,
                    'title' => $test->title,
                ],
            ]);
        }

        if (! $test->isActive()) {
            return Inertia::render('Join/Index', [
                'error' => 'This test is not currently active. Please check the test schedule.',
                'test' => [
                    'id' => $test->id,
                    'title' => $test->title,
                ],
            ]);
        }

        return Inertia::render('Join/ParticipantInfo', [
            'test' => [
                'id' => $test->id,
                'title' => $test->title,
                'description' => $test->description,
                'duration_minutes' => $test->duration_minutes,
                'questions_count' => $test->questions()->count(),
                'token' => $test->token,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'token' => 'required|string|exists:tests,token',
            'participant_name' => 'required|string|max:255',
            'participant_identifier' => 'nullable|string|max:255',
        ]);

        $test = Test::where('token', $request->token)->first();

        if (! $test || ! $test->isPublished() || ! $test->isActive()) {
            return back()->withErrors(['token' => 'This test is not available.']);
        }

        $attempt = $test->attempts()->create([
            'participant_name' => $request->participant_name,
            'participant_identifier' => $request->participant_identifier,
            'started_at' => now(),
            'expires_at' => now()->addMinutes($test->duration_minutes),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $questions = $test->questions()->get();

        foreach ($questions as $question) {
            $attempt->answers()->create([
                'question_id' => $question->id,
            ]);
        }

        \App\Models\AttemptEvent::log($attempt, \App\Enums\AttemptEventType::TEST_STARTED);

        return redirect()->route('attempt.show', $attempt->id);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\Test;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TestResultController extends Controller
{
    public function index(Request $request, Test $test): Response
    {
        Gate::authorize('view', $test);

        $search = $request->input('search');

        $attempts = $test->attempts()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('participant_name', 'like', "%{$search}%")
                      ->orWhere('participant_identifier', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total_attempts' => $test->attempts()->count(),
            'completed_attempts' => $test->attempts()->completed()->count(),
            'average_score' => round($test->attempts()->whereNotNull('score')->avg('score') ?? 0),
            'highest_score' => $test->attempts()->max('score') ?? 0,
            'lowest_score' => $test->attempts()->whereNotNull('score')->min('score') ?? 0,
        ];

        return Inertia::render('Tests/Results/Index', [
            'test' => $test,
            'attempts' => $attempts,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Request $request, Test $test, Attempt $attempt): Response
    {
        Gate::authorize('view', $test);

        abort_if($attempt->test_id !== $test->id, 404);

        $attempt->load(['answers.question.options', 'answers.questionOption']);

        $answers = $attempt->answers->map(function ($answer) {
            $question = $answer->question;
            $maxPoints = $question->pivot->points ?? $question->points;

            return [
                'id' => $answer->id,
                'question_id' => $question->id,
                'question' => $question->question,
                'type' => $question->type->value ?? $question->type,
                'max_points' => $maxPoints,
                'points_awarded' => $answer->points_awarded,
                'answer_text' => $answer->answer_text,
                'selected_option_id' => $answer->question_option_id,
                'selected_option_text' => $answer->questionOption?->text,
                'selected_option_key' => $answer->questionOption?->key,
                'is_correct' => $answer->is_correct,
                'is_graded' => $answer->is_graded,
                'feedback' => $answer->feedback,
                'options' => $question->options->map(fn($opt) => [
                    'id' => $opt->id,
                    'key' => $opt->key,
                    'text' => $opt->text,
                    'is_correct' => $opt->is_correct,
                ]),
            ];
        });

        return Inertia::render('Tests/Results/Show', [
            'test' => $test,
            'attempt' => [
                'id' => $attempt->id,
                'participant_name' => $attempt->participant_name,
                'participant_identifier' => $attempt->participant_identifier,
                'status' => $attempt->status->value,
                'score' => $attempt->score,
                'total_correct' => $attempt->total_correct,
                'total_wrong' => $attempt->total_wrong,
                'total_unanswered' => $attempt->total_unanswered,
                'time_spent_seconds' => $attempt->time_spent_seconds,
                'started_at' => $attempt->started_at?->toIso8601String(),
                'submitted_at' => $attempt->submitted_at?->toIso8601String(),
            ],
            'answers' => $answers,
        ]);
    }

    public function grade(Request $request, Test $test, Attempt $attempt): RedirectResponse
    {
        Gate::authorize('update', $test);

        abort_if($attempt->test_id !== $test->id, 404);

        $validated = $request->validate([
            'grades' => 'required|array',
            'grades.*.answer_id' => 'required|exists:attempt_answers,id',
            'grades.*.points_awarded' => 'required|numeric|min:0',
            'grades.*.feedback' => 'nullable|string|max:1000',
        ]);

        foreach ($validated['grades'] as $gradeData) {
            $answer = AttemptAnswer::where('attempt_id', $attempt->id)
                ->where('id', $gradeData['answer_id'])
                ->first();

            if ($answer) {
                $maxPoints = $answer->question->pivot->points ?? $answer->question->points;
                $pointsAwarded = min($gradeData['points_awarded'], $maxPoints);

                $answer->update([
                    'points_awarded' => $pointsAwarded,
                    'feedback' => $gradeData['feedback'] ?? null,
                    'is_graded' => true,
                    'is_correct' => $pointsAwarded > 0,
                ]);
            }
        }

        // Recalculate total score
        $this->recalculateAttemptScore($attempt);

        return back()->with('success', 'Grading updated successfully.');
    }

    private function recalculateAttemptScore(Attempt $attempt): void
    {
        $attempt->load(['test.questions', 'answers.question']);

        $totalScore = $attempt->answers->sum('points_awarded');
        
        $totalPossible = 0;
        foreach ($attempt->test->questions as $q) {
            $totalPossible += ($q->pivot->points ?? $q->points);
        }

        $finalScore = $totalPossible > 0 ? round(($totalScore / $totalPossible) * 100) : 0;

        $totalCorrect = $attempt->answers->where('is_correct', true)->count();
        $totalWrong = $attempt->answers->where('is_correct', false)->whereNotNull('is_correct')->count();

        $attempt->update([
            'score' => $finalScore,
            'total_correct' => $totalCorrect,
            'total_wrong' => $totalWrong,
        ]);
    }
}

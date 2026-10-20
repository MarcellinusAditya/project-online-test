<?php

namespace App\Http\Controllers;

use App\Enums\AttemptEventType;
use App\Models\Attempt;
use App\Models\Test;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResultsController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:all,draft,published,archived'],
        ]);

        $search = $validated['search'] ?? null;
        $status = $validated['status'] ?? 'all';

        $suspiciousTypes = [
            AttemptEventType::FULLSCREEN_EXITED->value,
            AttemptEventType::TAB_HIDDEN->value,
            AttemptEventType::WINDOW_BLUR->value,
            AttemptEventType::WARNING_ISSUED->value,
        ];

        $tests = $request->user()
            ->tests()
            ->withCount([
                'questions',
                'attempts',
                'attempts as completed_attempts_count' => fn($q) => $q->completed(),
                'attempts as graded_attempts_count' => fn($q) => $q->whereNotNull('score'),
                'attempts as passing_attempts_count' => fn($q) => $q
                    ->whereNotNull('score')
                    ->whereColumn('score', '>=', 'tests.passing_score'),
                'attempts as flagged_attempts_count' => fn($q) => $q->whereHas(
                    'events',
                    fn($eq) => $eq->whereIn('event_type', $suspiciousTypes)
                ),
            ])
            ->withAvg(['attempts as average_score' => fn($q) => $q->whereNotNull('score')], 'score')
            ->withMax('attempts', 'created_at')
            ->when($search, fn($q) => $q->where(fn($qq) => $qq
                ->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")))
            ->when($status !== 'all', fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $tests->getCollection()->transform(fn(Test $test) => [
            'id' => $test->id,
            'title' => $test->title,
            'status' => $test->status->value,
            'passing_score' => $test->passing_score,
            'questions_count' => $test->questions_count,
            'attempts_count' => $test->attempts_count,
            'completed_attempts_count' => $test->completed_attempts_count,
            'graded_attempts_count' => $test->graded_attempts_count,
            'passing_attempts_count' => $test->passing_attempts_count,
            'flagged_attempts_count' => $test->flagged_attempts_count,
            'average_score' => round($test->average_score ?? 0),
            'pass_rate' => $test->graded_attempts_count > 0
                ? round(($test->passing_attempts_count / $test->graded_attempts_count) * 100)
                : 0,
            'last_attempt_at' => $test->attempts_max_created_at,
        ]);

        $testIds = $request->user()->tests()->pluck('id');

        $overview = [
            'total_tests' => $testIds->count(),
            'published_tests' => $request->user()->tests()->where('status', 'published')->count(),
            'total_attempts' => Attempt::whereIn('test_id', $testIds)->count(),
            'completed_attempts' => Attempt::whereIn('test_id', $testIds)->completed()->count(),
            'graded_attempts' => Attempt::whereIn('test_id', $testIds)->whereNotNull('score')->count(),
            'average_score' => round(Attempt::whereIn('test_id', $testIds)->whereNotNull('score')->avg('score') ?? 0),
            'flagged_attempts' => Attempt::whereIn('test_id', $testIds)->whereHas(
                'events',
                fn($q) => $q->whereIn('event_type', $suspiciousTypes)
            )->count(),
        ];

        return Inertia::render('Results/Index', [
            'tests' => $tests,
            'overview' => $overview,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }
}

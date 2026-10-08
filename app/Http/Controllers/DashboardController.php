<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $totalTests = $user->tests()->count();
        $publishedTests = $user->tests()->where('status', 'published')->count();

        $testIds = $user->tests()->pluck('id');
        $totalParticipants = Attempt::whereIn('test_id', $testIds)->count();
        $averageScore = round(Attempt::whereIn('test_id', $testIds)->whereNotNull('score')->avg('score') ?? 0);

        $recentTests = $user->tests()
            ->withCount(['questions', 'attempts'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'totalTests' => $totalTests,
            'publishedTests' => $publishedTests,
            'totalParticipants' => $totalParticipants,
            'averageScore' => $averageScore,
            'recentTests' => $recentTests,
        ]);
    }
}

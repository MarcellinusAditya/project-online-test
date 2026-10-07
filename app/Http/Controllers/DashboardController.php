<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $totalTests = $user->tests()->count();
        $publishedTests = $user->tests()->where('status', 'published')->count();

        return Inertia::render('Dashboard', [
            'totalTests' => $totalTests,
            'publishedTests' => $publishedTests,
            'totalParticipants' => 0,
            'averageScore' => 0,
        ]);
    }
}

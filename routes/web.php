<?php

use App\Http\Controllers\AiGeneratorController;
use App\Http\Controllers\AttemptController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JoinController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuestionBankController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\TestResultController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::resource('tests', TestController::class);
    Route::post('tests/{test}/publish', [TestController::class, 'publish'])->name('tests.publish');
    Route::post('tests/{test}/unpublish', [TestController::class, 'unpublish'])->name('tests.unpublish');

    Route::resource('tests.questions', QuestionController::class)->except(['show']);
    Route::post('tests/{test}/questions/reorder', [QuestionController::class, 'reorder'])->name('tests.questions.reorder');
    Route::post('tests/{test}/questions/import', [QuestionController::class, 'import'])->name('tests.questions.import');

    Route::resource('question-banks', QuestionBankController::class);

    Route::get('tests/{test}/results', [TestResultController::class, 'index'])->name('tests.results.index');
    Route::get('tests/{test}/attempts/{attempt}', [TestResultController::class, 'show'])->name('tests.attempts.show');
    Route::post('tests/{test}/attempts/{attempt}/grade', [TestResultController::class, 'grade'])->name('tests.attempts.grade');
    Route::get('tests/{test}/export', [TestResultController::class, 'export'])->name('tests.export');

    Route::get('ai-generator', [AiGeneratorController::class, 'index'])->name('ai-generator.index');
    Route::post('ai-generator', [AiGeneratorController::class, 'store'])->name('ai-generator.store');
    Route::get('ai-generator/{generation}', [AiGeneratorController::class, 'show'])->name('ai-generator.show');
    Route::get('ai-generator/{generation}/status', [AiGeneratorController::class, 'status'])->name('ai-generator.status');
    Route::post('ai-generator/{generation}/approve', [AiGeneratorController::class, 'approve'])->name('ai-generator.approve');
    Route::delete('ai-generator/{generation}', [AiGeneratorController::class, 'destroy'])->name('ai-generator.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/join', [JoinController::class, 'show'])->name('join.show');
Route::post('/join', [JoinController::class, 'store'])->name('join.store');

Route::get('/attempt/{id}', [AttemptController::class, 'show'])->name('attempt.show');
Route::post('/attempt/{id}/answer', [AttemptController::class, 'saveAnswer'])->name('attempt.answer');
Route::post('/attempt/{id}/event', [AttemptController::class, 'logEvent'])->name('attempt.event');
Route::post('/attempt/{id}/submit', [AttemptController::class, 'submit'])->name('attempt.submit');
Route::get('/attempt/{id}/result', [AttemptController::class, 'result'])->name('attempt.result');

require __DIR__.'/auth.php';

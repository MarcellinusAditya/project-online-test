<?php

namespace App\Http\Controllers;

use App\Enums\QuestionType;
use App\Http\Requests\QuestionRequest;
use App\Models\Question;
use App\Models\Test;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    public function index(Request $request, Test $test): Response
    {
        Gate::authorize('view', $test);

        $questions = $test->questions()
            ->with('options')
            ->orderByPivot('sort_order')
            ->get();

        return Inertia::render('Tests/Questions/Index', [
            'test' => $test,
            'questions' => $questions,
        ]);
    }

    public function create(Request $request, Test $test): Response
    {
        Gate::authorize('update', $test);

        return Inertia::render('Tests/Questions/Create', [
            'test' => $test,
        ]);
    }

    public function store(QuestionRequest $request, Test $test): RedirectResponse
    {
        Gate::authorize('update', $test);

        DB::transaction(function () use ($request, $test) {
            $question = $test->questions()->create([
                'question_bank_id' => $this->getOrCreateQuestionBank($request->user(), $test),
                'question' => $request->input('question'),
                'type' => $request->input('type'),
                'points' => $request->input('points'),
                'explanation' => $request->input('explanation'),
            ]);

            if ($request->input('type') === QuestionType::MULTIPLE_CHOICE->value) {
                $correctIndex = $request->input('correct_option', 0);

                foreach ($request->input('options', []) as $index => $option) {
                    $question->options()->create([
                        'key' => $option['key'],
                        'text' => $option['text'],
                        'is_correct' => $index === $correctIndex,
                    ]);
                }
            }

            $maxOrder = $test->questions()->max('test_questions.sort_order') ?? 0;
            $test->questions()->updateExistingPivot($question->id, [
                'sort_order' => $maxOrder + 1,
            ]);
        });

        return redirect()->route('tests.questions.index', $test)
            ->with('success', 'Question added successfully.');
    }

    public function edit(Request $request, Test $test, Question $question): Response
    {
        Gate::authorize('update', $test);

        $question->load('options');

        return Inertia::render('Tests/Questions/Edit', [
            'test' => $test,
            'question' => $question,
        ]);
    }

    public function update(QuestionRequest $request, Test $test, Question $question): RedirectResponse
    {
        Gate::authorize('update', $test);

        DB::transaction(function () use ($request, $question) {
            $question->update([
                'question' => $request->input('question'),
                'type' => $request->input('type'),
                'points' => $request->input('points'),
                'explanation' => $request->input('explanation'),
            ]);

            $question->options()->delete();

            if ($request->input('type') === QuestionType::MULTIPLE_CHOICE->value) {
                $correctIndex = $request->input('correct_option', 0);

                foreach ($request->input('options', []) as $index => $option) {
                    $question->options()->create([
                        'key' => $option['key'],
                        'text' => $option['text'],
                        'is_correct' => $index === $correctIndex,
                    ]);
                }
            }
        });

        return redirect()->route('tests.questions.index', $test)
            ->with('success', 'Question updated successfully.');
    }

    public function destroy(Request $request, Test $test, Question $question): RedirectResponse
    {
        Gate::authorize('update', $test);

        $question->delete();

        return redirect()->route('tests.questions.index', $test)
            ->with('success', 'Question deleted successfully.');
    }

    private function getOrCreateQuestionBank($user, Test $test): int
    {
        $bank = $user->questionBanks()
            ->where('name', 'Test: '.$test->title)
            ->first();

        if (! $bank) {
            $bank = $user->questionBanks()->create([
                'name' => 'Test: '.$test->title,
                'description' => 'Auto-created question bank for test: '.$test->title,
            ]);
        }

        return $bank->id;
    }
}

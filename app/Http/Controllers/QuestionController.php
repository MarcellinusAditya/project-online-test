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
use Illuminate\Support\Facades\Storage;
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
            $questionImagePath = $request->hasFile('question_image')
                ? $request->file('question_image')->store('question-images', 'public')
                : null;

            $question = $test->questions()->create([
                'question_bank_id' => $this->getOrCreateQuestionBank($request->user(), $test),
                'question' => $request->input('question', ''),
                'image_path' => $questionImagePath,
                'type' => $request->input('type'),
                'points' => $request->input('points'),
                'explanation' => $request->input('explanation'),
            ]);

            if ($request->input('type') === QuestionType::MULTIPLE_CHOICE->value) {
                $correctIndex = $request->input('correct_option', 0);
                $optionImages = $request->file('options', []);

                foreach ($request->input('options', []) as $index => $option) {
                    $imagePath = isset($optionImages[$index]['image']) && $optionImages[$index]['image'] instanceof \Illuminate\Http\UploadedFile
                        ? $optionImages[$index]['image']->store('question-images', 'public')
                        : null;

                    $question->options()->create([
                        'key' => $option['key'],
                        'text' => $option['text'] ?? '',
                        'image_path' => $imagePath,
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
            $imagePath = $question->image_path;

            if ($request->boolean('remove_question_image') && $imagePath) {
                Storage::disk('public')->delete($imagePath);
                $imagePath = null;
            }

            if ($request->hasFile('question_image')) {
                if ($imagePath) {
                    Storage::disk('public')->delete($imagePath);
                }
                $imagePath = $request->file('question_image')->store('question-images', 'public');
            }

            $question->update([
                'question' => $request->input('question', ''),
                'image_path' => $imagePath,
                'type' => $request->input('type'),
                'points' => $request->input('points'),
                'explanation' => $request->input('explanation'),
            ]);

            $optionImages = $request->file('options', []);
            $newOptionsData = [];
            $keepPaths = [];

            if ($request->input('type') === QuestionType::MULTIPLE_CHOICE->value) {
                $correctIndex = (int) $request->input('correct_option', 0);
                $oldByKey = $question->options->keyBy('key');

                foreach ($request->input('options', []) as $index => $option) {
                    $optImagePath = isset($oldByKey[$option['key']]) ? $oldByKey[$option['key']]->image_path : null;

                    if (! empty($option['remove_image'])) {
                        $optImagePath = null;
                    }

                    if (isset($optionImages[$index]['image']) && $optionImages[$index]['image'] instanceof \Illuminate\Http\UploadedFile) {
                        $optImagePath = $optionImages[$index]['image']->store('question-images', 'public');
                    }

                    if ($optImagePath) {
                        $keepPaths[] = $optImagePath;
                    }

                    $newOptionsData[] = [
                        'key' => $option['key'],
                        'text' => $option['text'] ?? '',
                        'image_path' => $optImagePath,
                        'is_correct' => $index === $correctIndex,
                    ];
                }
            }

            // Delete old option image files that are no longer referenced.
            foreach ($question->options as $oldOption) {
                if ($oldOption->image_path && ! in_array($oldOption->image_path, $keepPaths, true)) {
                    Storage::disk('public')->delete($oldOption->image_path);
                }
            }
            $question->options()->delete();

            foreach ($newOptionsData as $optionData) {
                $question->options()->create($optionData);
            }
        });

        return redirect()->route('tests.questions.index', $test)
            ->with('success', 'Question updated successfully.');
    }

    public function destroy(Request $request, Test $test, Question $question): RedirectResponse
    {
        Gate::authorize('update', $test);

        if ($question->image_path) {
            Storage::disk('public')->delete($question->image_path);
        }

        foreach ($question->options as $option) {
            if ($option->image_path) {
                Storage::disk('public')->delete($option->image_path);
            }
        }

        $question->delete();

        return redirect()->route('tests.questions.index', $test)
            ->with('success', 'Question deleted successfully.');
    }

    public function reorder(Request $request, Test $test): RedirectResponse
    {
        Gate::authorize('update', $test);

        $validated = $request->validate([
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'integer|exists:questions,id',
        ]);

        $ownedIds = $test->questions()->pluck('questions.id')->all();
        $sentIds = array_map('intval', $validated['question_ids']);
        sort($ownedIds);
        $sortedSent = $sentIds;
        sort($sortedSent);

        abort_if($ownedIds !== $sortedSent, 422, 'Question list does not match this test.');

        DB::transaction(function () use ($test, $validated) {
            foreach ($validated['question_ids'] as $position => $questionId) {
                $test->questions()->updateExistingPivot($questionId, [
                    'sort_order' => $position + 1,
                ]);
            }
        });

        return redirect()->route('tests.questions.index', $test)
            ->with('success', 'Question order updated successfully.');
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

<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateQuestionsJob;
use App\Models\AiGeneration;
use App\Models\Test;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AiGeneratorController extends Controller
{
    public function index(Request $request): Response
    {
        $generations = $request->user()->aiGenerations()
            ->with('test:id,title')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $tests = $request->user()->tests()
            ->select('id', 'title')
            ->latest()
            ->take(100)
            ->get();

        return Inertia::render('AiGenerator/Index', [
            'generations' => $generations,
            'tests' => $tests,
            'aiConfigured' => ! empty(config('services.ai.key')),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'source_file' => 'required|file|mimes:pdf,txt|max:10240',
            'test_id' => 'nullable|integer|exists:tests,id',
            'question_count' => 'required|integer|min:1|max:20',
            'question_type' => 'required|string|in:multiple_choice,essay',
            'difficulty' => 'required|string|in:easy,medium,hard',
        ]);

        if (! empty($validated['test_id'])) {
            $test = Test::findOrFail($validated['test_id']);
            Gate::authorize('update', $test);
        }

        $path = $request->file('source_file')->store('ai-uploads', 'local');

        $generation = $request->user()->aiGenerations()->create([
            'test_id' => $validated['test_id'] ?? null,
            'source_filename' => $request->file('source_file')->getClientOriginalName(),
            'source_path' => $path,
            'status' => AiGeneration::STATUS_PENDING,
            'question_count' => $validated['question_count'],
            'question_type' => $validated['question_type'],
            'difficulty' => $validated['difficulty'],
        ]);

        GenerateQuestionsJob::dispatch($generation->id);

        return redirect()->route('ai-generator.show', $generation)
            ->with('success', 'File uploaded. Generating questions in the background.');
    }

    public function show(Request $request, AiGeneration $generation): Response
    {
        $this->authorizeGeneration($request, $generation);

        $generation->load('test:id,title');

        $tests = $request->user()->tests()
            ->select('id', 'title')
            ->latest()
            ->take(100)
            ->get();

        return Inertia::render('AiGenerator/Show', [
            'generation' => $generation,
            'tests' => $tests,
        ]);
    }

    public function status(Request $request, AiGeneration $generation)
    {
        $this->authorizeGeneration($request, $generation);

        return response()->json([
            'status' => $generation->status,
            'draft_count' => is_array($generation->draft_questions) ? count($generation->draft_questions) : 0,
            'error_message' => $generation->error_message,
            'provider' => $generation->provider,
        ]);
    }

    public function approve(Request $request, AiGeneration $generation): RedirectResponse
    {
        $this->authorizeGeneration($request, $generation);

        abort_if($generation->status !== AiGeneration::STATUS_COMPLETED, 422, 'Generation is not ready for review.');

        $validated = $request->validate([
            'test_id' => 'required|integer|exists:tests,id',
            'items' => 'required|array|min:1',
            'items.*.question' => 'required|string|max:5000',
            'items.*.type' => 'required|string|in:multiple_choice,essay',
            'items.*.points' => 'required|integer|min:1|max:100',
            'items.*.explanation' => 'nullable|string|max:5000',
            'items.*.options' => 'required_if:items.*.type,multiple_choice|array|min:2|max:6',
            'items.*.options.*.text' => 'required_with:items.*.options|string|max:2000',
            'items.*.options.*.is_correct' => 'boolean',
        ]);

        $test = Test::findOrFail($validated['test_id']);
        Gate::authorize('update', $test);

        $bankId = $this->getOrCreateBank($request->user(), $test);

        DB::transaction(function () use ($test, $bankId, $validated) {
            $maxOrder = $test->questions()->max('test_questions.sort_order') ?? 0;

            foreach ($validated['items'] as $item) {
                $question = $test->questions()->create([
                    'question_bank_id' => $bankId,
                    'question' => $item['question'],
                    'type' => $item['type'],
                    'points' => $item['points'],
                    'explanation' => $item['explanation'] ?? null,
                ]);

                if ($item['type'] === 'multiple_choice') {
                    $keys = ['A', 'B', 'C', 'D', 'E', 'F'];
                    $hasCorrect = collect($item['options'])->contains('is_correct', true);
                    foreach (array_slice($item['options'], 0, 6) as $i => $opt) {
                        $question->options()->create([
                            'key' => $keys[$i],
                            'text' => $opt['text'],
                            'is_correct' => $hasCorrect ? (bool) ($opt['is_correct'] ?? false) : $i === 0,
                        ]);
                    }
                }

                $maxOrder++;
                $test->questions()->updateExistingPivot($question->id, ['sort_order' => $maxOrder]);
            }
        });

        $count = count($validated['items']);

        return redirect()->route('tests.questions.index', $test)
            ->with('success', "{$count} AI-generated question(s) added to \"{$test->title}\".");
    }

    public function destroy(Request $request, AiGeneration $generation): RedirectResponse
    {
        $this->authorizeGeneration($request, $generation);

        Storage::disk('local')->delete($generation->source_path);
        $generation->delete();

        return redirect()->route('ai-generator.index')
            ->with('success', 'AI generation discarded.');
    }

    private function authorizeGeneration(Request $request, AiGeneration $generation): void
    {
        abort_if($generation->user_id !== $request->user()->id, 403);
    }

    private function getOrCreateBank($user, Test $test): int
    {
        $bank = $user->questionBanks()->where('name', 'Test: '.$test->title)->first();

        if (! $bank) {
            $bank = $user->questionBanks()->create([
                'name' => 'Test: '.$test->title,
                'description' => 'Auto-created question bank for test: '.$test->title,
            ]);
        }

        return $bank->id;
    }
}

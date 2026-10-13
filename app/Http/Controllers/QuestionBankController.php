<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuestionBankRequest;
use App\Models\QuestionBank;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuestionBankController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $search = $validated['search'] ?? null;

        $banks = $request->user()
            ->questionBanks()
            ->withCount('questions')
            ->when($search, fn($q) => $q->where(fn($qq) => $qq
                ->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('QuestionBanks/Index', [
            'banks' => $banks,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('QuestionBanks/Create');
    }

    public function store(QuestionBankRequest $request): RedirectResponse
    {
        $bank = $request->user()->questionBanks()->create($request->validated());

        return redirect()->route('question-banks.show', $bank)
            ->with('success', 'Question bank created successfully.');
    }

    public function show(QuestionBank $questionBank): Response
    {
        Gate::authorize('view', $questionBank);

        $questionBank->loadCount('questions');

        $questions = $questionBank->questions()
            ->with('options')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $tests = $questionBank->user->tests()
            ->select('id', 'title')
            ->latest()
            ->take(100)
            ->get();

        return Inertia::render('QuestionBanks/Show', [
            'bank' => $questionBank,
            'questions' => $questions,
            'tests' => $tests,
        ]);
    }

    public function edit(QuestionBank $questionBank): Response
    {
        Gate::authorize('update', $questionBank);

        return Inertia::render('QuestionBanks/Edit', [
            'bank' => $questionBank,
        ]);
    }

    public function update(QuestionBankRequest $request, QuestionBank $questionBank): RedirectResponse
    {
        Gate::authorize('update', $questionBank);

        $questionBank->update($request->validated());

        return redirect()->route('question-banks.show', $questionBank)
            ->with('success', 'Question bank updated successfully.');
    }

    public function destroy(QuestionBank $questionBank): RedirectResponse
    {
        Gate::authorize('delete', $questionBank);

        $questionBank->delete();

        return redirect()->route('question-banks.index')
            ->with('success', 'Question bank deleted successfully.');
    }
}

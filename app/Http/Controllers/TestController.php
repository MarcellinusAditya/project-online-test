<?php

namespace App\Http\Controllers;

use App\Enums\TestStatus;
use App\Http\Requests\TestRequest;
use App\Models\Test;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TestController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:all,draft,published,archived'],
        ]);

        $search = $validated['search'] ?? null;
        $status = $validated['status'] ?? 'all';

        $tests = $request->user()
            ->tests()
            ->withCount('questions')
            ->when($search, fn($q) => $q->where(fn($qq) => $qq
                ->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")))
            ->when($status !== 'all', fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Tests/Index', [
            'tests' => $tests,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Tests/Create');
    }

    public function store(TestRequest $request): RedirectResponse
    {
        $test = $request->user()->tests()->create([
            ...$request->validated(),
            'token' => Test::generateToken(),
            'status' => TestStatus::DRAFT,
        ]);

        return redirect()->route('tests.show', $test)
            ->with('success', 'Test created successfully.');
    }

    public function show(Test $test): Response
    {
        Gate::authorize('view', $test);

        $test->loadCount('questions');

        return Inertia::render('Tests/Show', [
            'test' => $test,
        ]);
    }

    public function edit(Test $test): Response
    {
        Gate::authorize('update', $test);

        return Inertia::render('Tests/Edit', [
            'test' => $test,
        ]);
    }

    public function update(TestRequest $request, Test $test): RedirectResponse
    {
        Gate::authorize('update', $test);

        $test->update($request->validated());

        return redirect()->route('tests.show', $test)
            ->with('success', 'Test updated successfully.');
    }

    public function destroy(Test $test): RedirectResponse
    {
        Gate::authorize('delete', $test);

        $test->delete();

        return redirect()->route('tests.index')
            ->with('success', 'Test deleted successfully.');
    }

    public function publish(Test $test): RedirectResponse
    {
        Gate::authorize('update', $test);

        $test->update(['status' => TestStatus::PUBLISHED]);

        return redirect()->route('tests.show', $test)
            ->with('success', 'Test published successfully.');
    }

    public function unpublish(Test $test): RedirectResponse
    {
        Gate::authorize('update', $test);

        $test->update(['status' => TestStatus::DRAFT]);

        return redirect()->route('tests.show', $test)
            ->with('success', 'Test unpublished successfully.');
    }
}

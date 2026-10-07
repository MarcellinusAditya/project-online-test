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
        $tests = $request->user()
            ->tests()
            ->withCount('questions')
            ->latest()
            ->paginate(12);

        return Inertia::render('Tests/Index', [
            'tests' => $tests,
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

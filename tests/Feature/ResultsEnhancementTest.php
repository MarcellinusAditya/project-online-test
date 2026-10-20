<?php

use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\Question;
use App\Models\Test;
use App\Models\User;
use Illuminate\Support\Facades\DB;

function makeTestFor(User $user, array $overrides = []): Test
{
    $test = Test::factory()->for($user)->published()->create(array_merge([
        'token' => Test::generateToken(),
        'passing_score' => 70,
    ], $overrides));

    $bank = $user->questionBanks()->create(['name' => 'Bank '.uniqid()]);
    $question = Question::create([
        'question_bank_id' => $bank->id,
        'question' => 'What is 2 + 2?',
        'type' => 'multiple_choice',
        'points' => 10,
    ]);
    $question->options()->createMany([
        ['key' => 'A', 'text' => '4', 'is_correct' => true],
        ['key' => 'B', 'text' => '5', 'is_correct' => false],
    ]);

    $test->questions()->attach($question->id, ['sort_order' => 1, 'points' => 10]);

    return $test;
}

function makeAttempt(Test $test, string $name, ?int $score, AttemptStatus $status = AttemptStatus::SUBMITTED, ?string $startedAt = null): Attempt
{
    return Attempt::create([
        'test_id' => $test->id,
        'participant_name' => $name,
        'participant_identifier' => 'ID-'.uniqid(),
        'started_at' => $startedAt ? now()->parse($startedAt) : now()->subMinutes(30),
        'expires_at' => now()->addMinutes(30),
        'submitted_at' => now(),
        'status' => $status,
        'score' => $score,
        'total_correct' => $score !== null ? 1 : 0,
        'total_wrong' => 0,
        'total_unanswered' => 0,
        'time_spent_seconds' => 1800,
    ]);
}

test('guests cannot access global results', function () {
    $this->get('/results')->assertRedirect('/login');
});

test('owner sees only their own tests on the global results page', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    $mine = makeTestFor($owner, ['title' => 'My Visible Test']);
    makeTestFor($other, ['title' => 'Someone Elses Test']);

    makeAttempt($mine, 'Alice', 90);
    makeAttempt($mine, 'Bob', 50);

    $response = $this->actingAs($owner)->get('/results');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Results/Index')
        ->has('tests.data', 1)
        ->where('tests.data.0.title', 'My Visible Test')
        ->where('tests.data.0.attempts_count', 2)
        ->where('tests.data.0.passing_attempts_count', 1)
        ->where('tests.data.0.pass_rate', 50)
        ->where('overview.total_attempts', 2)
    );
});

test('global results can be filtered by search and status', function () {
    $user = User::factory()->create();
    makeTestFor($user, ['title' => 'Mathematics Midterm']);
    makeTestFor($user, ['title' => 'Physics Final']);

    $this->actingAs($user)
        ->get('/results?search=Math')
        ->assertInertia(fn ($page) => $page->has('tests.data', 1)->where('tests.data.0.title', 'Mathematics Midterm'));

    $this->actingAs($user)
        ->get('/results?status=draft')
        ->assertInertia(fn ($page) => $page->has('tests.data', 0));
});

test('non owner cannot view another users test results', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $test = makeTestFor($owner);

    $this->actingAs($intruder)
        ->get(route('tests.results.index', $test))
        ->assertForbidden();
});

test('per test results calculate pass rate and filter by participant status', function () {
    $user = User::factory()->create();
    $test = makeTestFor($user, ['passing_score' => 60]);

    makeAttempt($test, 'Passing One', 90);
    makeAttempt($test, 'Failing One', 40);
    makeAttempt($test, 'Still Going', null, AttemptStatus::IN_PROGRESS);

    $this->actingAs($user)
        ->get(route('tests.results.index', $test))
        ->assertInertia(fn ($page) => $page
            ->component('Tests/Results/Index')
            ->where('stats.total_attempts', 3)
            ->where('stats.passing_attempts', 1)
            ->where('stats.pass_rate', 50)
            ->where('filters.status', 'all')
        );

    $this->actingAs($user)
        ->get(route('tests.results.index', ['test' => $test, 'status' => 'in_progress']))
        ->assertInertia(fn ($page) => $page
            ->has('attempts.data', 1)
            ->where('attempts.data.0.participant_name', 'Still Going')
        );
});

test('invalid status filter is rejected', function () {
    $user = User::factory()->create();
    $test = makeTestFor($user);

    $this->actingAs($user)
        ->get(route('tests.results.index', ['test' => $test, 'status' => 'bogus']))
        ->assertSessionHasErrors('status');
});

test('passing score can be set when creating a test', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('tests.store'), [
            'title' => 'Graded Test',
            'description' => 'With a passing score',
            'duration_minutes' => 45,
            'show_result' => true,
            'passing_score' => 80,
        ])
        ->assertRedirect();

    expect(Test::where('title', 'Graded Test')->first()->passing_score)->toBe(80);
});

test('passing score must be between 0 and 100', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('tests.store'), [
            'title' => 'Bad Score Test',
            'duration_minutes' => 45,
            'passing_score' => 150,
        ])
        ->assertSessionHasErrors('passing_score');
});

test('export downloads csv filtered by status and returns only matching participants', function () {
    $user = User::factory()->create();
    $test = makeTestFor($user);

    makeAttempt($test, 'Submitted Person', 80);
    makeAttempt($test, 'Expired Person', 20, AttemptStatus::EXPIRED);

    $response = $this->actingAs($user)->get(route('tests.export', [
        'test' => $test,
        'format' => 'csv',
        'status' => 'submitted',
    ]));

    $response->assertOk();
    expect($response->baseResponse->headers->get('content-disposition'))->toContain('.csv');

    $content = file_get_contents($response->baseResponse->getFile()->getPathname());
    expect($content)->toContain('Submitted Person')
        ->and($content)->not->toContain('Expired Person')
        ->and($content)->toContain('Warnings');
});

test('export defaults to xlsx and includes both sheets', function () {
    $user = User::factory()->create();
    $test = makeTestFor($user);
    makeAttempt($test, 'Excel Person', 70);

    $response = $this->actingAs($user)->get(route('tests.export', $test));

    $response->assertOk();
    expect($response->baseResponse->headers->get('content-type'))->toContain('spreadsheet');
});

test('export applies date range filter', function () {
    $user = User::factory()->create();
    $test = makeTestFor($user);

    makeAttempt($test, 'Old Person', 80, AttemptStatus::SUBMITTED, now()->subDays(10)->toDateTimeString());
    makeAttempt($test, 'New Person', 80, AttemptStatus::SUBMITTED, now()->subDay()->toDateTimeString());

    $response = $this->actingAs($user)->get(route('tests.export', [
        'test' => $test,
        'format' => 'csv',
        'date_from' => now()->subDays(3)->toDateString(),
    ]));

    $content = file_get_contents($response->baseResponse->getFile()->getPathname());
    expect($content)->toContain('New Person')
        ->and($content)->not->toContain('Old Person');
});

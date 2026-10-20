<?php

use App\Jobs\SendResultsWebhook;
use App\Models\Attempt;
use App\Models\Question;
use App\Models\Test;
use App\Models\User;
use App\Models\UserSetting;
use App\Notifications\NewAttemptNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

function settingsTestFor(User $user, array $overrides = []): Test
{
    $test = Test::factory()->for($user)->published()->create(array_merge([
        'token' => Test::generateToken(),
        'passing_score' => 70,
        'start_at' => null,
        'end_at' => null,
    ], $overrides));

    $bank = $user->questionBanks()->create(['name' => 'Bank '.uniqid()]);
    $question = Question::create([
        'question_bank_id' => $bank->id,
        'question' => 'Pick A',
        'type' => 'multiple_choice',
        'points' => 10,
    ]);
    $question->options()->createMany([
        ['key' => 'A', 'text' => 'Correct', 'is_correct' => true],
        ['key' => 'B', 'text' => 'Wrong', 'is_correct' => false],
    ]);
    $test->questions()->attach($question->id, ['sort_order' => 1, 'points' => 10]);

    return $test;
}

test('guests are redirected from settings', function () {
    $this->get('/settings')->assertRedirect('/login');
});

test('settings page renders with defaults created on first access', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/settings')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Settings/Index')
            ->where('settings.theme', 'system')
            ->where('settings.default_duration_minutes', 60)
            ->where('settings.default_passing_score', 70)
            ->where('settings.notify_new_attempt', true)
            ->where('profile.email', $user->email)
        );

    expect(UserSetting::where('user_id', $user->id)->count())->toBe(1);
});

test('settings are isolated per user', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    $a->settingsOrDefault()->update(['default_duration_minutes' => 30]);
    $b->settingsOrDefault();

    $this->actingAs($b)
        ->get('/settings')
        ->assertInertia(fn ($page) => $page->where('settings.default_duration_minutes', 60));
});

test('profile settings can be updated', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/settings/profile', [
            'name' => 'Renamed User',
            'email' => 'renamed@example.com',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($user->fresh())
        ->name->toBe('Renamed User')
        ->email->toBe('renamed@example.com');
});

test('email cannot collide with another user', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)
        ->post('/settings/profile', ['name' => 'X', 'email' => $other->email])
        ->assertSessionHasErrors('email');
});

test('avatar upload replaces the previous file', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $old = UploadedFile::fake()->image('old.jpg')->store('avatars', 'public');
    $user->update(['avatar_path' => $old]);

    $this->actingAs($user)
        ->post('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->image('new.png', 200, 200),
        ])
        ->assertSessionHasNoErrors();

    $user->refresh();

    expect($user->avatar_path)->not->toBe($old)
        ->and($user->avatar_path)->toStartWith('avatars/');
    Storage::disk('public')->assertMissing($old);
    Storage::disk('public')->assertExists($user->avatar_path);
});

test('avatar upload rejects oversized and non image files', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->create('doc.pdf', 200, 'application/pdf'),
        ])
        ->assertSessionHasErrors('avatar');

    $this->actingAs($user)
        ->post('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => UploadedFile::fake()->image('big.jpg')->size(3000),
        ])
        ->assertSessionHasErrors('avatar');
});

test('avatar can be removed', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $path = UploadedFile::fake()->image('a.jpg')->store('avatars', 'public');
    $user->update(['avatar_path' => $path]);

    $this->actingAs($user)->delete('/settings/avatar')->assertRedirect();

    expect($user->fresh()->avatar_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('test defaults are validated and saved', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch('/settings/test-defaults', [
            'default_duration_minutes' => 45,
            'default_passing_score' => 65,
            'default_show_result' => false,
            'auto_publish' => true,
        ])
        ->assertSessionHasNoErrors();

    $settings = $user->fresh()->settings;
    expect($settings->default_duration_minutes)->toBe(45)
        ->and($settings->default_passing_score)->toBe(65)
        ->and($settings->default_show_result)->toBeFalse()
        ->and($settings->auto_publish)->toBeTrue();

    $this->actingAs($user)
        ->patch('/settings/test-defaults', [
            'default_duration_minutes' => 0,
            'default_passing_score' => 500,
            'default_show_result' => true,
            'auto_publish' => false,
        ])
        ->assertSessionHasErrors(['default_duration_minutes', 'default_passing_score']);
});

test('test create page passes saved defaults and new tests use them', function () {
    $user = User::factory()->create();
    $user->settingsOrDefault()->update([
        'default_duration_minutes' => 25,
        'default_passing_score' => 40,
        'default_show_result' => false,
        'auto_publish' => true,
    ]);

    $this->actingAs($user)
        ->get('/tests/create')
        ->assertInertia(fn ($page) => $page
            ->where('defaults.duration_minutes', 25)
            ->where('defaults.passing_score', 40)
            ->where('defaults.show_result', false)
        );

    $this->actingAs($user)->post('/tests', [
        'title' => 'Auto Published Test',
        'duration_minutes' => 25,
        'passing_score' => 40,
        'show_result' => false,
    ])->assertRedirect();

    $test = Test::where('title', 'Auto Published Test')->first();
    expect($test->status->value)->toBe('published');
});

test('auto publish off still creates drafts', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/tests', [
        'title' => 'Draft Test',
        'duration_minutes' => 30,
        'passing_score' => 70,
    ])->assertRedirect();

    expect(Test::where('title', 'Draft Test')->first()->status->value)->toBe('draft');
});

test('appearance theme saves and rejects unknown themes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch('/settings/appearance', ['theme' => 'dark'])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->settings->theme)->toBe('dark');

    $this->actingAs($user)
        ->patch('/settings/appearance', ['theme' => 'neon'])
        ->assertSessionHasErrors('theme');
});

test('notification preferences save', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch('/settings/notifications', [
            'notify_new_attempt' => false,
            'notify_daily_summary' => true,
            'notify_weekly_report' => true,
        ])
        ->assertSessionHasNoErrors();

    $settings = $user->fresh()->settings;
    expect($settings->notify_new_attempt)->toBeFalse()
        ->and($settings->notify_daily_summary)->toBeTrue()
        ->and($settings->notify_weekly_report)->toBeTrue();
});

test('integrations webhook url is validated and saved', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch('/settings/integrations', ['webhook_url' => 'not-a-url'])
        ->assertSessionHasErrors('webhook_url');

    $this->actingAs($user)
        ->patch('/settings/integrations', ['webhook_url' => 'https://example.com/hook'])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->settings->webhook_url)->toBe('https://example.com/hook');
});

test('new participant notifies owner when enabled', function () {
    Notification::fake();

    $owner = User::factory()->create();
    $owner->settingsOrDefault()->update(['notify_new_attempt' => true]);
    $test = settingsTestFor($owner);

    $this->post('/join', [
        'token' => $test->token,
        'participant_name' => 'Participant One',
    ])->assertRedirect();

    Notification::assertSentTo($owner, NewAttemptNotification::class);
});

test('new participant does not notify owner when disabled', function () {
    Notification::fake();

    $owner = User::factory()->create();
    $owner->settingsOrDefault()->update(['notify_new_attempt' => false]);
    $test = settingsTestFor($owner);

    $this->post('/join', [
        'token' => $test->token,
        'participant_name' => 'Participant Two',
    ])->assertRedirect();

    Notification::assertNothingSentTo($owner);
});

test('submitting an attempt queues the results webhook', function () {
    Queue::fake();

    $owner = User::factory()->create();
    $test = settingsTestFor($owner);
    $attempt = Attempt::create([
        'test_id' => $test->id,
        'participant_name' => 'Webhook Person',
        'started_at' => now()->subMinutes(10),
        'expires_at' => now()->addMinutes(20),
        'status' => 'in_progress',
    ]);

    $this->post(route('attempt.submit', $attempt->id))->assertRedirect();

    Queue::assertPushed(SendResultsWebhook::class);
});

test('account deletion requires the correct password', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from('/settings')
        ->delete('/settings/account', ['password' => 'wrong-password'])
        ->assertSessionHasErrors('password')
        ->assertRedirect('/settings');

    expect($user->fresh())->not->toBeNull();

    $this->actingAs($user)
        ->delete('/settings/account', ['password' => 'password'])
        ->assertRedirect('/');

    $this->assertGuest();
    expect(User::find($user->id))->toBeNull();
});

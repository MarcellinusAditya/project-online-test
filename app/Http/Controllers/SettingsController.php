<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $settings = $user->settingsOrDefault();

        return Inertia::render('Settings/Index', [
            'settings' => [
                'default_duration_minutes' => $settings->default_duration_minutes,
                'default_passing_score' => $settings->default_passing_score,
                'default_show_result' => $settings->default_show_result,
                'auto_publish' => $settings->auto_publish,
                'theme' => $settings->theme,
                'notify_new_attempt' => $settings->notify_new_attempt,
                'notify_daily_summary' => $settings->notify_daily_summary,
                'notify_weekly_report' => $settings->notify_weekly_report,
                'webhook_url' => $settings->webhook_url,
            ],
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
            ],
            'themes' => UserSetting::THEMES,
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1024'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            $user->avatar_path = $request->file('avatar')->store('avatars', 'public');
        }

        $user->save();

        return back()->with('success', 'Profile updated.');
    }

    public function removeAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
            $user->update(['avatar_path' => null]);
        }

        return back()->with('success', 'Avatar removed.');
    }

    public function updateTestDefaults(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'default_duration_minutes' => ['required', 'integer', 'min:1', 'max:480'],
            'default_passing_score' => ['required', 'integer', 'min:0', 'max:100'],
            'default_show_result' => ['required', 'boolean'],
            'auto_publish' => ['required', 'boolean'],
        ]);

        $request->user()->settingsOrDefault()->update($validated);

        return back()->with('success', 'Test defaults saved.');
    }

    public function updateAppearance(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'theme' => ['required', 'string', Rule::in(UserSetting::THEMES)],
        ]);

        $request->user()->settingsOrDefault()->update($validated);

        return back()->with('success', 'Appearance saved.');
    }

    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notify_new_attempt' => ['required', 'boolean'],
            'notify_daily_summary' => ['required', 'boolean'],
            'notify_weekly_report' => ['required', 'boolean'],
        ]);

        $request->user()->settingsOrDefault()->update($validated);

        return back()->with('success', 'Notification preferences saved.');
    }

    public function updateIntegrations(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'webhook_url' => ['nullable', 'url', 'max:500'],
        ]);

        $request->user()->settingsOrDefault()->update($validated);

        return back()->with('success', 'Integration settings saved.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        \Illuminate\Support\Facades\Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}

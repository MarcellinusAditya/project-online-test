<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'default_duration_minutes',
        'default_passing_score',
        'default_show_result',
        'auto_publish',
        'theme',
        'notify_new_attempt',
        'notify_daily_summary',
        'notify_weekly_report',
        'webhook_url',
    ];

    protected $casts = [
        'default_duration_minutes' => 'integer',
        'default_passing_score' => 'integer',
        'default_show_result' => 'boolean',
        'auto_publish' => 'boolean',
        'notify_new_attempt' => 'boolean',
        'notify_daily_summary' => 'boolean',
        'notify_weekly_report' => 'boolean',
    ];

    public const THEMES = ['light', 'dark', 'system'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

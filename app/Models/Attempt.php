<?php

namespace App\Models;

use App\Enums\AttemptStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_id',
        'participant_name',
        'participant_identifier',
        'started_at',
        'expires_at',
        'submitted_at',
        'status',
        'score',
        'total_correct',
        'total_wrong',
        'total_unanswered',
        'time_spent_seconds',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'submitted_at' => 'datetime',
        'status' => AttemptStatus::class,
        'score' => 'integer',
        'total_correct' => 'integer',
        'total_wrong' => 'integer',
        'total_unanswered' => 'integer',
        'time_spent_seconds' => 'integer',
    ];

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(AttemptAnswer::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(AttemptEvent::class);
    }

    public function isActive(): bool
    {
        return $this->status === AttemptStatus::IN_PROGRESS;
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function getRemainingSecondsAttribute(): int
    {
        if ($this->isExpired()) {
            return 0;
        }

        return max(0, $this->expires_at->diffInSeconds(now()));
    }

    public function getProgressPercentageAttribute(): float
    {
        $totalQuestions = $this->test->questions()->count();
        if ($totalQuestions === 0) {
            return 0;
        }

        $answeredQuestions = $this->answers()->count();
        return ($answeredQuestions / $totalQuestions) * 100;
    }

    public function scopeActive($query)
    {
        return $query->where('status', AttemptStatus::IN_PROGRESS);
    }

    public function scopeForTest($query, int $testId)
    {
        return $query->where('test_id', $testId);
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', [AttemptStatus::SUBMITTED, AttemptStatus::EXPIRED]);
    }
}

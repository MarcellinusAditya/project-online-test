<?php

namespace App\Models;

use App\Enums\AttemptEventType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttemptEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'attempt_id',
        'event_type',
        'event_data',
    ];

    protected $casts = [
        'event_type' => AttemptEventType::class,
        'event_data' => 'array',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(Attempt::class);
    }

    public static function log(Attempt $attempt, AttemptEventType $type, array $data = null): static
    {
        return static::create([
            'attempt_id' => $attempt->id,
            'event_type' => $type,
            'event_data' => $data,
        ]);
    }
}

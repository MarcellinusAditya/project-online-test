<?php

namespace App\Console\Commands;

use App\Models\Attempt;
use App\Models\User;
use Illuminate\Console\Command;

class SendSummaryEmails extends Command
{
    protected $signature = 'settings:send-summaries {period=daily : daily or weekly}';

    protected $description = 'Send daily or weekly result summaries to providers who opted in';

    public function handle(): int
    {
        $period = $this->argument('period');

        if (! in_array($period, ['daily', 'weekly'], true)) {
            $this->error('Period must be daily or weekly.');

            return self::FAILURE;
        }

        $since = $period === 'daily' ? now()->subDay() : now()->subWeek();
        $flag = $period === 'daily' ? 'notify_daily_summary' : 'notify_weekly_report';

        $sent = 0;

        User::query()
            ->whereHas('settings', fn ($q) => $q->where($flag, true))
            ->with('settings')
            ->chunkById(100, function ($users) use ($since, $period, &$sent) {
                foreach ($users as $user) {
                    $testIds = $user->tests()->pluck('id');

                    if ($testIds->isEmpty()) {
                        continue;
                    }

                    $attempts = Attempt::whereIn('test_id', $testIds)
                        ->where('created_at', '>=', $since)
                        ->get();

                    if ($attempts->isEmpty()) {
                        continue;
                    }

                    $user->notify(new \App\Notifications\ResultsSummaryNotification(
                        period: $period,
                        totalAttempts: $attempts->count(),
                        completedAttempts: $attempts->whereIn('status', ['submitted', 'expired'])->count(),
                        averageScore: (int) round($attempts->whereNotNull('score')->avg('score') ?? 0),
                        since: $since,
                    ));

                    $sent++;
                }
            });

        $this->info("Sent {$sent} {$period} summary email(s).");

        return self::SUCCESS;
    }
}

<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

class ResultsSummaryNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected string $period,
        protected int $totalAttempts,
        protected int $completedAttempts,
        protected int $averageScore,
        protected Carbon $since,
    ) {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(ucfirst($this->period).' results summary')
            ->greeting(ucfirst($this->period).' summary')
            ->line('Since '.$this->since->format('d M Y H:i').':')
            ->line("Participants: {$this->totalAttempts}")
            ->line("Completed: {$this->completedAttempts}")
            ->line("Average score: {$this->averageScore}%")
            ->action('Open results', route('results.index'));
    }
}

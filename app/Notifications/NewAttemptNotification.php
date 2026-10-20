<?php

namespace App\Notifications;

use App\Models\Attempt;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewAttemptNotification extends Notification
{
    use Queueable;

    public function __construct(protected Attempt $attempt)
    {
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
        $test = $this->attempt->test;

        return (new MailMessage)
            ->subject("New participant on {$test->title}")
            ->greeting('New participant')
            ->line("{$this->attempt->participant_name} has started \"{$test->title}\".")
            ->when($this->attempt->participant_identifier, fn (MailMessage $mail) => $mail->line(
                "Identifier: {$this->attempt->participant_identifier}"
            ))
            ->line('Started at: '.$this->attempt->started_at?->format('d M Y H:i'))
            ->action('View results', route('tests.results.index', $test));
    }
}

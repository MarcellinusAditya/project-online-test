<?php

namespace App\Enums;

enum AttemptEventType: string
{
    case TEST_STARTED = 'test_started';
    case TEST_SUBMITTED = 'test_submitted';
    case TEST_EXPIRED = 'test_expired';
    case FULLSCREEN_ENTERED = 'fullscreen_entered';
    case FULLSCREEN_EXITED = 'fullscreen_exited';
    case TAB_HIDDEN = 'tab_hidden';
    case TAB_VISIBLE = 'tab_visible';
    case WINDOW_BLUR = 'window_blur';
    case WINDOW_FOCUS = 'window_focus';
    case ANSWER_SAVED = 'answer_saved';
    case WARNING_ISSUED = 'warning_issued';

    public function label(): string
    {
        return match ($this) {
            self::TEST_STARTED => 'Test Started',
            self::TEST_SUBMITTED => 'Test Submitted',
            self::TEST_EXPIRED => 'Test Expired',
            self::FULLSCREEN_ENTERED => 'Fullscreen Entered',
            self::FULLSCREEN_EXITED => 'Fullscreen Exited',
            self::TAB_HIDDEN => 'Tab Hidden',
            self::TAB_VISIBLE => 'Tab Visible',
            self::WINDOW_BLUR => 'Window Blur',
            self::WINDOW_FOCUS => 'Window Focus',
            self::ANSWER_SAVED => 'Answer Saved',
            self::WARNING_ISSUED => 'Warning Issued',
        };
    }
}

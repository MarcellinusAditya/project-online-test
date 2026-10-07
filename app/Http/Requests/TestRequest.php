<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $testId = $this->route('test')?->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_at' => ['nullable', 'date', 'after_or_equal:now'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:480'],
            'show_result' => ['boolean'],
        ];
    }
}

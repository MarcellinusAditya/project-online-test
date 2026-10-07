<?php

namespace App\Http\Requests;

use App\Enums\QuestionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['required', 'string'],
            'type' => ['required', Rule::enum(QuestionType::class)],
            'points' => ['required', 'integer', 'min:1', 'max:100'],
            'explanation' => ['nullable', 'string'],
            'options' => ['required_if:type,multiple_choice', 'array', 'min:2'],
            'options.*.key' => ['required_with:options', 'string', 'max:10'],
            'options.*.text' => ['required_with:options', 'string'],
            'options.*.is_correct' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'options.min' => 'Multiple choice must have at least 2 options.',
        ];
    }
}

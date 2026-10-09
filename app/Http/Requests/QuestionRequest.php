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
            'question' => ['required_without:question_image', 'nullable', 'string'],
            'question_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1024'],
            'remove_question_image' => ['sometimes', 'boolean'],
            'type' => ['required', Rule::enum(QuestionType::class)],
            'points' => ['required', 'integer', 'min:1', 'max:100'],
            'explanation' => ['nullable', 'string'],
            'options' => ['required_if:type,multiple_choice', 'array', 'min:2'],
            'options.*.key' => ['required_with:options', 'string', 'max:10'],
            'options.*.text' => ['nullable', 'string'],
            'options.*.image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1024'],
            'options.*.remove_image' => ['sometimes', 'boolean'],
            'options.*.existing_image_path' => ['nullable', 'string', 'max:255'],
            'options.*.is_correct' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'options.min' => 'Multiple choice must have at least 2 options.',
            'question.required_without' => 'Question text is required when no image is provided.',
            'question_image.max' => 'Question image must not exceed 1 MB.',
            'options.*.image.max' => 'Option image must not exceed 1 MB.',
        ];
    }
}

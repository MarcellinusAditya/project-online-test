<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $bankId = $this->route('question_bank')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('question_banks', 'name')
                    ->where('user_id', $this->user()->id)
                    ->ignore($bankId),
            ],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'You already have a question bank with this name.',
        ];
    }
}

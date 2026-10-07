export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface Test {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    token: string;
    start_at: string | null;
    end_at: string | null;
    duration_minutes: number;
    status: 'draft' | 'published' | 'archived';
    show_result: boolean;
    created_at: string;
    updated_at: string;
    questions_count?: number;
}

export interface QuestionOption {
    id: number;
    question_id: number;
    key: string;
    text: string;
    is_correct: boolean;
    created_at: string;
    updated_at: string;
}

export interface Question {
    id: number;
    question_bank_id: number;
    question: string;
    type: 'multiple_choice' | 'essay';
    points: number;
    explanation: string | null;
    created_at: string;
    updated_at: string;
    options?: QuestionOption[];
    pivot?: {
        sort_order: number;
        points: number | null;
    };
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

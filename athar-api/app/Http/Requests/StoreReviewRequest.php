<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
            'reviewable_type' => 'required|string|in:gift,need',
            'reviewable_id' => 'required|integer',
        ];
    }

    /**
     * Custom Arabic validation messages.
     */
    public function messages(): array
    {
        return [
            'rating.required' => 'يرجى تحديد التقييم بالنجوم.',
            'rating.integer' => 'قيمة التقييم يجب أن تكون رقماً صحيحاً.',
            'rating.min' => 'أدنى تقييم مسموح به هو نجمة واحدة.',
            'rating.max' => 'أعلى تقييم مسموح به هو 5 نجوم.',
            'comment.max' => 'التعليق لا يجب أن يتجاوز 500 حرف.',
            'reviewable_type.required' => 'نوع المورد المراد تقييمه مطلوب.',
            'reviewable_type.in' => 'نوع المورد يجب أن يكون إما هدية (gift) أو طلب (need).',
            'reviewable_id.required' => 'معرف المورد المراد تقييمه مطلوب.',
        ];
    }
}

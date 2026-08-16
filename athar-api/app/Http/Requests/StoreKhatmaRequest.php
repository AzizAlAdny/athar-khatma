<?php

namespace App\Http\Requests;

use App\Constants\KhatmaConstants;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class StoreKhatmaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // This is handled by the middleware in routes, so we return true here
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'completion_date' => 'required|date',
            'gift_ids' => 'required|array|min:1',
            'gift_ids.*' => 'exists:gifts,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'completion_date.required' => 'تاريخ الإتمام مطلوب',
            'completion_date.date' => 'تاريخ الإتمام يجب أن يكون تاريخاً صحيحاً',
            'gift_ids.required' => 'يجب اختيار هدية واحدة على الأقل',
            'gift_ids.array' => 'الهدية يجب أن تكون قائمة',
            'gift_ids.min' => 'يجب اختيار هدية واحدة على الأقل',
            'gift_ids.*.exists' => 'الهدية المختارة غير موجودة',
        ];
    }
}

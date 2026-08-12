<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class StoreNeedRequest extends FormRequest
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
            'gift_id' => 'required|exists:gifts,id',
            'description' => 'required|string|max:1000',
            'city' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
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
            'gift_id.required' => 'يجب اختيار نوع الهدية',
            'gift_id.exists' => 'الهدية المختارة غير موجودة',
            'description.required' => 'الوصف مطلوب',
            'description.max' => 'الوصف يجب أن لا يتجاوز 1000 حرف',
            'city.max' => 'اسم المدينة يجب أن لا يتجاوز 255 حرف',
            'latitude.numeric' => 'خط العرض يجب أن يكون رقماً',
            'latitude.between' => 'خط العرض يجب أن يكون بين -90 و 90',
            'longitude.numeric' => 'خط الطول يجب أن يكون رقماً',
            'longitude.between' => 'خط الطول يجب أن يكون بين -180 و 180',
        ];
    }
}

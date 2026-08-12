<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تم تسجيل طلبك بنجاح</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #D0A45F 0%, #8B4513 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ختمة وأثر</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">تم تسجيل طلبك بنجاح</p>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0 0 20px;">السلام عليكم ورحمة الله وبركاته،</p>

            <p style="margin: 0 0 20px;">تم تسجيل طلبك بنجاح في منصة ختمة وأثر. سيتم إضافته إلى قائمة الطلبات وسيتمكن المتطوعين من رؤيته والتعاون معك.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px; color: #D0A45F;">تفاصيل الطلب:</h3>
                <ul style="margin: 0; padding-right: 20px;">
                    <li>نوع الهدية: {{ $need->gift->name ?? 'غير محدد' }}</li>
                    <li>المدينة: {{ $need->city }}</li>
                    <li>الحالة: {{ $need->status }}</li>
                </ul>
            </div>

            <p style="margin: 20px 0;">يمكنك متابعة حالة طلبك في لوحة التحكم.</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ config('app.url') }}/needs" style="display: inline-block; background: #D0A45F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">انتقل إلى الطلبات</a>
            </div>

            <p style="margin: 0; color: #666; font-size: 14px;">نتمنى لك التوفيق في خدمتك.</p>
        </div>
    </div>
</body>
</html>

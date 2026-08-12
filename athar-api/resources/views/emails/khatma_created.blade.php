<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تم تسجيل ختمتك بنجاح</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #154A32 0%, #0d3121 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ختمة وأثر</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">تم تسجيل ختمتك بنجاح</p>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0 0 20px;">السلام عليكم ورحمة الله وبركاته،</p>

            <p style="margin: 0 0 20px;">نبارك بتسجيل ختمتك الجديدة في منصة ختمة وأثر. هذه خطوة مهمة في رحلة الإيمان والتأثير الإيجابي.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px; color: #154A32;">تفاصيل الختمة:</h3>
                <ul style="margin: 0; padding-right: 20px;">
                    <li>تاريخ الإتمام: {{ $khatma->completion_date }}</li>
                    <li>نوع الختمة: {{ $khatma->type }}</li>
                    <li>نقاط الأثر: {{ $khatma->impact_score }}</li>
                </ul>
            </div>

            <p style="margin: 20px 0;">يمكنك الآن متابعة تقدمك وعرض ختماتك في لوحة التحكم.</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ config('app.url') }}/dashboard" style="display: inline-block; background: #154A32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">انتقل إلى لوحة التحكم</a>
            </div>

            <p style="margin: 0; color: #666; font-size: 14px;">شكراً لانضمامك إلى مجتمع ختمة وأثر.</p>
        </div>
    </div>
</body>
</html>

<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رمز التحقق</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #154A32 0%, #0d3121 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ختمة وأثر</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">رمز التحقق من البريد الإلكتروني</p>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0 0 20px;">السلام عليكم ورحمة الله وبركاته،</p>

            <p style="margin: 0 0 20px;">أهلاً بكِ {{ $name }}،</p>

            <p style="margin: 0 0 20px;">شكراً لتسجيلك في منصة ختمة وأثر. لإكمال عملية التسجيل، يرجى استخدام رمز التحقق التالي:</p>

            <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border: 2px solid #154A32;">
                <h2 style="margin: 0; font-size: 32px; color: #154A32; letter-spacing: 5px; font-weight: bold;">{{ $code }}</h2>
            </div>

            <p style="margin: 0 0 15px; color: #666; font-size: 14px;">هذا الرمز صالح لمدة 15 دقيقة فقط.</p>

            <p style="margin: 20px 0;">إذا لم تقومي بطلب هذا الرمز، يرجى تجاهل هذه الرسالة.</p>

            <p style="margin: 0; color: #666; font-size: 14px;">فريق ختمة وأثر</p>
        </div>
    </div>
</body>
</html>
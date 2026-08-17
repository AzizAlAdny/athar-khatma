<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #154A32 0%, #0d3121 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ختمة وأثر</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">إعادة تعيين كلمة المرور</p>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0 0 20px;">السلام عليكم ورحمة الله وبركاته،</p>

            <p style="margin: 0 0 20px;">أهلاً بكِ {{ $name }}،</p>

            <p style="margin: 0 0 20px;">استلمنا طلباً لإعادة تعيين كلمة المرور لحسابك. إذا كان هذا الطلب منك، يرجى الضغط على الزر أدناه لتعيين كلمة مرور جديدة:</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $resetUrl }}" style="display: inline-block; background: #154A32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">إعادة تعيين كلمة المرور</a>
            </div>

            <p style="margin: 20px 0; color: #666; font-size: 14px;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>

            <p style="margin: 20px 0;">إذا لم تقومي بطلب هذا التغيير، يرجى تجاهل هذه الرسالة واتخاذ الإجراءات اللازمة لحماية حسابك.</p>

            <p style="margin: 0; color: #666; font-size: 14px;">فريق ختمة وأثر</p>
        </div>
    </div>
</body>
</html>
# إعداد QR Codes مع الدومين الصحيح

## المشكلة

QR codes كانت تبدأ دائماً بـ `http://localhost:3000` حتى بعد رفع المشروع على دومين.

## الحل

### 1. إنشاء ملف `.env.local`

أنشئ ملف `.env.local` في المجلد الرئيسي للمشروع وأضف المتغير التالي:

```bash
NEXT_PUBLIC_APP_URL=https://your-actual-domain.com
```

### 2. استبدل `your-actual-domain.com` بالدومين الحقيقي

مثال:

```bash
NEXT_PUBLIC_APP_URL=https://sawra-dashboard.com
```

### 3. إعادة تشغيل التطبيق

بعد إضافة المتغير البيئي، أعد تشغيل التطبيق:

```bash
npm run dev
# أو
npm run build && npm start
```

## التحسينات المضافة

1. **دالة `getBaseUrl()`**: تحصل على URL الأساسي بطريقة ذكية
2. **دعم `window.location.origin`**: إذا لم يكن متغير البيئة محدد، سيستخدم URL الحالي
3. **التحقق من صحة URL**: دالة `validateAndCleanUrl()` للتحقق من صحة URL

## ملاحظات مهمة

- تأكد من أن الدومين يبدأ بـ `https://` أو `http://`
- لا تضع `/` في نهاية الدومين
- أعد تشغيل التطبيق بعد تغيير متغيرات البيئة

## مثال صحيح

```bash
# صحيح
NEXT_PUBLIC_APP_URL=https://sawra-dashboard.com

# خاطئ
NEXT_PUBLIC_APP_URL=https://sawra-dashboard.com/
NEXT_PUBLIC_APP_URL=sawra-dashboard.com
```

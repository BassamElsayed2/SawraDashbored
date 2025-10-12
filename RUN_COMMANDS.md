# أوامر التشغيل السريعة ⚡

## التشغيل الأول (First Run)

### 1. تثبيت التبعيات

```bash
cd dashbored
npm install
```

### 2. إعداد متغيرات البيئة

تأكد من وجود ملف `.env.local` مع:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. تنفيذ قاعدة البيانات

```bash
# افتح Supabase Dashboard → SQL Editor
# نفذ محتويات الملف:
# ../app/supabase_orders_table.sql
```

### 4. تشغيل المشروع

```bash
npm run dev
```

### 5. الوصول للنظام

```
http://localhost:3000
```

---

## الأوامر اليومية (Daily Commands)

### تشغيل المشروع

```bash
npm run dev
```

### بناء المشروع للإنتاج

```bash
npm run build
```

### تشغيل نسخة الإنتاج

```bash
npm start
```

### فحص الأخطاء (Linting)

```bash
npm run lint
```

---

## أوامر التطوير (Development)

### مراقبة التغييرات

```bash
npm run dev
# المشروع سيعيد التحميل تلقائياً عند التغيير
```

### فحص Types

```bash
npx tsc --noEmit
```

### تنظيف الكود

```bash
npm run lint -- --fix
```

---

## الوصول السريع للصفحات 🔗

### لوحة التحكم الرئيسية

```
http://localhost:3000/dashboard
```

### نظام الطلبات

```
http://localhost:3000/dashboard/orders
```

### تفاصيل طلب محدد

```
http://localhost:3000/dashboard/orders/[ORDER_ID]
```

مثال:

```
http://localhost:3000/dashboard/orders/123e4567-e89b-12d3-a456-426614174000
```

---

## حل المشاكل (Troubleshooting)

### المشكلة: Port 3000 مستخدم

```bash
# استخدم port آخر
npm run dev -- -p 3001
```

### المشكلة: أخطاء في التبعيات

```bash
# احذف node_modules وأعد التثبيت
rm -rf node_modules
rm package-lock.json
npm install
```

### المشكلة: أخطاء في Next.js Cache

```bash
# احذف cache Next.js
rm -rf .next
npm run dev
```

### المشكلة: أخطاء TypeScript

```bash
# تحقق من الأخطاء
npx tsc --noEmit

# إذا استمرت المشاكل
rm -rf node_modules .next
npm install
npm run dev
```

---

## أوامر قاعدة البيانات (Database)

### إنشاء جدول الطلبات

```sql
-- نفذ في Supabase SQL Editor
-- محتوى ملف: ../app/supabase_orders_table.sql
```

### التحقق من الجدول

```sql
-- في Supabase SQL Editor
SELECT * FROM orders LIMIT 10;
```

### عرض إحصائيات سريعة

```sql
SELECT
  status,
  COUNT(*) as count,
  SUM(total) as total_revenue
FROM orders
GROUP BY status;
```

---

## نصائح التطوير 💡

### 1. استخدم Hot Reload

```
- التغييرات تظهر تلقائياً
- لا حاجة لإعادة تشغيل المشروع
```

### 2. راقب Console

```
- F12 في المتصفح
- تحقق من الأخطاء
- راقب Network Requests
```

### 3. استخدم React DevTools

```
- ثبت React DevTools Extension
- افحص Components
- راقب State Changes
```

---

## المتطلبات (Requirements)

### Node.js

```bash
# يجب أن يكون 18.0.0 أو أحدث
node --version
```

### npm

```bash
# يجب أن يكون 9.0.0 أو أحدث
npm --version
```

### Git

```bash
git --version
```

---

## الاختصارات المفيدة ⌨️

### في المشروع

```
Ctrl + C          → إيقاف المشروع
Ctrl + R          → إعادة تحميل الصفحة
Ctrl + Shift + R  → إعادة تحميل وتجاهل Cache
F12               → فتح Developer Tools
```

### في VS Code

```
Ctrl + P          → البحث عن ملف
Ctrl + Shift + F  → البحث في المشروع
Ctrl + `          → فتح Terminal
F5                → Debug
```

---

## نصائح الأداء ⚡

### تسريع Development

```bash
# استخدم Turbo
npm run dev --turbo
```

### تقليل حجم Bundle

```bash
# تحليل Bundle
npm run build
npm run analyze
```

---

## الاختبار (Testing)

### اختبار يدوي سريع

```
1. ✅ تسجيل الدخول
2. ✅ عرض قائمة الطلبات
3. ✅ تصفية الطلبات
4. ✅ تغيير حالة طلب
5. ✅ عرض تفاصيل طلب
6. ✅ إضافة ملاحظات
```

### اختبار على أجهزة مختلفة

```
Desktop: http://localhost:3000
Mobile:  http://YOUR_IP:3000
```

---

## النشر (Deployment)

### Build للإنتاج

```bash
npm run build
```

### التحقق من Build

```bash
npm start
```

### النشر على Vercel

```bash
npm install -g vercel
vercel deploy
```

---

<div align="center">

**جاهز للتطوير! 🚀**

ابدأ بـ: `npm run dev`

</div>

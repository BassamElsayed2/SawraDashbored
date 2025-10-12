# 🛡️ نظام الحماية والصلاحيات - Dashboard

## 📋 نظرة عامة

تم تطبيق نظام حماية متعدد الطبقات لمنع المستخدمين غير المصرح لهم من الوصول إلى لوحة التحكم (Dashboard).

---

## 🔐 مستويات الحماية

### **المستوى 1: التحقق عند تسجيل الدخول**

📁 الملف: `src/components/Authentication/useSignIn.tsx`

```typescript
// ✅ يتم التحقق فوراً بعد تسجيل الدخول
const { data: adminProfile } = await supabase
  .from("admin_profiles")
  .select("user_id")
  .eq("user_id", data.user.id)
  .single();

// ❌ إذا لم يُعثر على سجل في admin_profiles
if (!adminProfile) {
  await supabase.auth.signOut(); // تسجيل خروج فوري
  toast.error("عذراً، ليس لديك صلاحيات للوصول إلى لوحة التحكم");
  router.push("/?error=unauthorized");
}
```

**النتيجة:** المستخدم العادي لن يتمكن من تسجيل الدخول أساساً!

---

### **المستوى 2: الحماية على مستوى Server Component**

📁 الملف: `src/app/(protected)/layout.tsx`

```typescript
// ✅ تحقق من الجلسة
const {
  data: { session },
} = await supabase.auth.getSession();
if (!session) redirect("/");

// ✅ تحقق من صلاحيات الأدمن
const { data: adminProfile, error } = await supabase
  .from("admin_profiles")
  .select("user_id")
  .eq("user_id", session.user.id)
  .single();

// ❌ منع الوصول إذا لم يكن أدمن
if (error || !adminProfile) {
  redirect("/?error=unauthorized");
}
```

**النتيجة:** حتى لو تجاوز المستخدم المستوى الأول، لن يتمكن من الوصول للصفحات المحمية!

---

### **المستوى 3: الحماية على مستوى Client Component**

📁 الملف: `src/app/(protected)/ProtectedWrapper.tsx`

```typescript
// ✅ تحقق إضافي على مستوى العميل
const checkSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    router.replace("/");
    return;
  }

  // ✅ تحقق من admin_profiles
  const { data: adminProfile, error } = await supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", session.user.id)
    .single();

  if (error || !adminProfile) {
    router.replace("/?error=unauthorized");
    return;
  }
};
```

**النتيجة:** طبقة حماية ثالثة للتأكد التام!

---

## 🚫 رسائل الخطأ

### **رسالة "وصول غير مصرح به"**

📁 الملف: `src/app/page.tsx`

**المميزات:**

- ✅ رسالة واضحة ومفصلة بالعربية
- ✅ دعم الوضع الليلي (Dark Mode)
- ✅ زر إغلاق (X) للرسالة
- ✅ تختفي تلقائياً بعد 10 ثواني
- ✅ تصميم احترافي مع أيقونة 🚫

**الشكل:**

```
🚫 وصول غير مصرح به
عذراً، ليس لديك صلاحيات للوصول إلى لوحة التحكم.
هذه اللوحة مخصصة للمسؤولين فقط.
إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع المسؤول.
```

---

## 📊 الفرق بين الجداول

### **جدول `profiles` - المستخدمون العاديون (App)**

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

- ✅ يُنشأ تلقائياً عند التسجيل في التطبيق
- ✅ للمستخدمين العاديين (Customers)
- ✅ لا يمنح صلاحيات الوصول للداشبورد

---

### **جدول `admin_profiles` - المسؤولون (Dashboard)**

```sql
CREATE TABLE admin_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  address TEXT,
  about TEXT,
  image_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

- ✅ يُنشأ يدوياً فقط من قبل المسؤول (في `/dashboard/add-user`)
- ✅ للمسؤولين والموظفين فقط
- ✅ **وجود سجل في هذا الجدول = صلاحية الوصول للداشبورد**

---

## 🎯 السيناريوهات

### **السيناريو 1: مستخدم عادي يحاول الدخول**

```
1. المستخدم يسجل في التطبيق (App) ✅
   → يُنشأ سجل في جدول "profiles"

2. المستخدم يحاول تسجيل الدخول للداشبورد ❌
   → البريد والباسورد صحيحان
   → لكن لا يوجد سجل في "admin_profiles"

3. النتيجة:
   ❌ تسجيل خروج فوري
   🚫 رسالة: "عذراً، ليس لديك صلاحيات"
   ↩️ إعادة توجيه لصفحة تسجيل الدخول
```

---

### **السيناريو 2: مسؤول يسجل الدخول**

```
1. المسؤول تم إضافته من `/dashboard/add-user` ✅
   → يُنشأ سجل في جدول "admin_profiles"

2. المسؤول يسجل الدخول للداشبورد ✅
   → البريد والباسورد صحيحان
   → يوجد سجل في "admin_profiles"

3. النتيجة:
   ✅ تسجيل دخول ناجح
   ✅ الوصول لجميع صفحات الداشبورد
```

---

### **السيناريو 3: مستخدم يحاول الوصول مباشرة لصفحة محمية**

```
1. المستخدم يفتح: http://localhost:3000/dashboard

2. التحقق في layout.tsx:
   ❌ لا توجد جلسة → إعادة توجيه لـ "/"
   أو
   ❌ لا يوجد سجل في admin_profiles → إعادة توجيه لـ "/?error=unauthorized"

3. النتيجة:
   🚫 رسالة خطأ
   ↩️ صفحة تسجيل الدخول
```

---

## 🔧 كيفية إضافة مسؤول جديد

### **الطريقة الصحيحة:**

1. تسجيل الدخول كمسؤول موجود
2. الذهاب إلى: `/dashboard/add-user`
3. إدخال بيانات المسؤول الجديد
4. الضغط على "إنشاء الحساب"

**هذا سينشئ:**

- ✅ حساب في Supabase Auth
- ✅ سجل في جدول `admin_profiles`
- ✅ صلاحيات كاملة للوصول للداشبورد

---

## ⚠️ ملاحظات مهمة

### **1. الأمان متعدد الطبقات**

```
Layer 1: التحقق عند تسجيل الدخول (useSignIn)
         ↓
Layer 2: التحقق في Server Component (layout)
         ↓
Layer 3: التحقق في Client Component (ProtectedWrapper)
```

### **2. لا يمكن للمستخدمين العاديين الوصول**

- ❌ حتى لو كان لديهم البريد والباسورد الصحيحان
- ❌ حتى لو حاولوا الوصول مباشرة للـ URL
- ❌ حتى لو عدّلوا الـ cookies أو الـ session

### **3. الحماية تعمل على:**

- ✅ Server-Side Rendering (SSR)
- ✅ Client-Side Rendering (CSR)
- ✅ Static Pages
- ✅ Protected Routes

---

## 🧪 اختبار الحماية

### **اختبار 1: مستخدم عادي**

```bash
# 1. سجل مستخدم جديد في التطبيق (App)
Email: user@test.com
Password: Test@123

# 2. حاول تسجيل الدخول للداشبورد بنفس البيانات
→ النتيجة المتوقعة: ❌ رفض الوصول + رسالة خطأ
```

### **اختبار 2: مسؤول**

```bash
# 1. أضف مسؤول من /dashboard/add-user
Email: admin@test.com
Password: Admin@123

# 2. سجل الدخول للداشبورد
→ النتيجة المتوقعة: ✅ دخول ناجح
```

### **اختبار 3: وصول مباشر**

```bash
# بدون تسجيل دخول، حاول فتح:
http://localhost:3000/dashboard

→ النتيجة المتوقعة: ↩️ إعادة توجيه لصفحة تسجيل الدخول
```

---

## 📝 التحديثات المستقبلية

### **اقتراحات للتحسين:**

1. **إضافة نظام الأدوار (Roles):**

   ```sql
   ALTER TABLE admin_profiles ADD COLUMN role TEXT DEFAULT 'staff';
   -- Roles: 'super_admin', 'admin', 'staff', 'viewer'
   ```

2. **إضافة نظام الصلاحيات (Permissions):**

   ```sql
   CREATE TABLE permissions (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES admin_profiles(user_id),
     can_create BOOLEAN DEFAULT false,
     can_edit BOOLEAN DEFAULT false,
     can_delete BOOLEAN DEFAULT false,
     can_view BOOLEAN DEFAULT true
   );
   ```

3. **تسجيل محاولات الوصول المرفوضة:**
   ```sql
   CREATE TABLE access_logs (
     id UUID PRIMARY KEY,
     user_email TEXT,
     attempted_at TIMESTAMP,
     ip_address TEXT,
     status TEXT -- 'success', 'denied', 'failed'
   );
   ```

---

## ✅ الخلاصة

**تم تطبيق نظام حماية قوي ومتعدد الطبقات يمنع المستخدمين العاديين من الوصول إلى لوحة التحكم تماماً.**

**المميزات:**

- ✅ أمان متعدد الطبقات (3 مستويات)
- ✅ رسائل خطأ واضحة بالعربية
- ✅ دعم الوضع الليلي
- ✅ تجربة مستخدم ممتازة
- ✅ كود نظيف وموثق

---

**تاريخ التطبيق:** 2025-10-12
**الإصدار:** 1.0.0
**الحالة:** ✅ مفعّل ويعمل

// api/pay.js

export default async function handler(req, res) {
    // 1. السماح فقط بطلبات POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'عذراً، الطريقة غير مسموح بها' });
    }

    try {
        const { amount, packageName } = req.body;

        // 2. التحقق من وجود البيانات المرسلة من المتصفح
        if (!amount || !packageName) {
            return res.status(400).json({ message: 'بيانات الطلب غير مكتملة' });
        }

        // 3. إرسال الطلب إلى بوابة Chargily Pay V2
        // ملاحظة: استعملنا "test" في الرابط أدناه، قم بتغييره إلى "live" عند إطلاق الموقع رسمياً
        const response = await fetch('https://pay.chargily.net/test/api/v2/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CHARGILY_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: [
                    {
                        price_data: {
                            currency: 'dzd',
                            unit_amount: parseInt(amount), // التأكد من أن المبلغ رقم صحيح (دج)
                            product_data: {
                                name: packageName
                            },
                        },
                        quantity: 1,
                    },
                ],
                // الرابط الذي سيعود إليه العميل بعد الدفع بنجاح
                success_url: `https://${req.headers.host}/success.html`,
            }),
        });

        const data = await response.json();

        // 4. فحص استجابة Chargily
        if (response.ok) {
            // إرسال رابط الدفع (checkout_url) للعميل ليتم توجيهه تلقائياً
            return res.status(200).json({ checkout_url: data.checkout_url });
        } else {
            // طباعة الخطأ في سجلات Vercel لتسهيل تتبعه
            console.error("Chargily API Error Detailed:", data);
            return res.status(response.status).json({ 
                message: 'خطأ من بوابة الدفع', 
                details: data 
            });
        }

    } catch (error) {
        // 5. معالجة أي خطأ تقني مفاجئ في السيرفر
        console.error("Internal Server Error:", error);
        return res.status(500).json({ message: 'حدث خطأ تقني في السيرفر' });
    }
}

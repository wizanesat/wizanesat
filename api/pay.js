// api/pay.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        const { amount, packageName } = req.body;

        // تحويل المبلغ إلى رقم صحيح (Chargily لا تقبل الكسور أو النصوص)
        const unitAmount = parseInt(amount);

        // رابط الموقع الديناميكي (تأكد أن موقعك يعمل بـ HTTPS على Vercel)
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const successUrl = `https://${host}/success.html`;

        const response = await fetch('https://pay.chargily.net/test/api/v2/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CHARGILY_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "items": [
                    {
                        "price_data": {
                            "currency": "dzd",
                            "unit_amount": unitAmount,
                            "product_data": {
                                "name": packageName
                            }
                        },
                        "quantity": 1
                    }
                ],
                "success_url": successUrl
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ checkout_url: data.checkout_url });
        } else {
            // طباعة تفاصيل الخطأ في Vercel Logs لمعرفة الحقل المرفوض بالضبط
            console.error("DEBUG CHARGILY:", JSON.stringify(data, null, 2));
            return res.status(response.status).json(data);
        }
    } catch (error) {
        console.error("CRITICAL ERROR:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

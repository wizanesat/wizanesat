export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { amount, packageName } = req.body;

        // تأكد من تحويل المبلغ لرقم صحيح (إلزامي لـ Chargily)
        const finalAmount = parseInt(amount);

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
                            "unit_amount": finalAmount,
                            "product_data": {
                                "name": packageName
                            }
                        },
                        "quantity": 1
                    }
                ],
                // استعمل رابط مباشر مؤقتاً للتأكد من الصحة أو تأكد من req.headers.host
                "success_url": `https://${req.headers.host}/success.html`
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ checkout_url: data.checkout_url });
        } else {
            // هنا سنطبع الخطأ الحقيقي القادم من Chargily لنعرف أي حقل هو السبب
            console.error("Chargily Detailed Error:", data);
            return res.status(response.status).json({ 
                message: 'Chargily Server Error', 
                errors: data.errors // هذا الحقل سيخبرنا أين المشكلة بالضبط (مثلاً في العملة أو الرابط)
            });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

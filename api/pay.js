export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { amount, packageName } = req.body;

        // التحقق من وصول البيانات
        if (!amount || !packageName) {
            return res.status(400).json({ message: 'Missing data' });
        }

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
                            unit_amount: amount, // تأكد أنه رقم صحيح
                            product_data: { name: packageName },
                        },
                        quantity: 1,
                    },
                ],
                success_url: 'https://' + req.headers.host + '/success.html',
            }),
        });

        const data = await response.json();
        
        if (response.ok) {
            res.status(200).json({ checkout_url: data.checkout_url });
        } else {
            console.error("Chargily Error:", data);
            res.status(500).json({ error: "Chargily API Error", details: data });
        }
    } catch (error) {
        console.error("Server Crash:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

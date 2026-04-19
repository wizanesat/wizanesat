// داخل api/pay.js
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
                    "unit_amount": Number(amount), // التأكد من أنه رقم وليس نص
                    "product_data": {
                        "name": packageName
                    }
                },
                "quantity": 1
            }
        ],
        "success_url": `https://${req.headers.host}/success.html`,
        // أضف هذا السطر لتجنب بعض مشاكل التوجيه
        "metadata": { "user_email": "customer@email.com" } 
    }),
});

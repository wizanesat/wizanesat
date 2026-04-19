// api/pay.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { amount, packageName } = req.body;

  const response = await fetch('https://pay.chargily.net/test/api/v2/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CHARGILY_SECRET_KEY}`, // سيتم وضعه في إعدادات Vercel
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "items": [{
          "price_data": {
            "currency": "dzd",
            "unit_amount": amount,
            "product_data": { "name": packageName }
          },
          "quantity": 1
      }],
      "success_url": "https://your-site.vercel.app/success.html"
    })
  });

  const data = await response.json();
  res.status(200).json({ checkout_url: data.checkout_url });
}

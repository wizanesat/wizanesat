export default async function handler(req, res) {
    if (req.method === 'POST') {
        const event = req.body;
        console.log("وصلت إشارة دفع جديدة:", event);

        // هنا يمكنك تحديث حالة الطلب في Firebase إلى "completed"
        // بناءً على id الطلب القادم من Chargily

        res.status(200).send('Webhook Received');
    } else {
        res.status(405).send('Method Not Allowed');
    }
}

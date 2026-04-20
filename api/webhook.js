import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إعدادات Firebase (تأكد من مطابقتها لإعداداتك في index.html)
const firebaseConfig = {
  apiKey: "AIzaSyCdoquNPVZIl8hvmCn8g6LM2DStQjD-8ac",
  authDomain: "wizanesat-iptv-b7d4c.firebaseapp.com",
  projectId: "wizanesat-iptv-b7d4c",
  storageBucket: "wizanesat-iptv-b7d4c.firebasestorage.app",
  messagingSenderId: "102150577326",
  appId: "1:102150577326:web:0f8a5391559acdade5e13f",
  measurementId: "G-BFXXF9Y3K7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const event = req.body;

    // التأكد من أن الحدث هو نجاح عملية الدفع
    if (event.type === 'checkout.paid') {
        const checkoutData = event.data;
        const userEmail = checkoutData.metadata?.user_email; // الحصول على إيميل العميل من البيانات المرسلة

        try {
            // البحث عن طلب العميل في Firestore باستخدام الإيميل أو المعرف
            const ordersRef = collection(db, "orders");
            const q = query(ordersRef, where("userEmail", "==", userEmail), where("status", "==", "pending"));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // تحديث حالة الطلب إلى "completed"
                const orderDoc = querySnapshot.docs[0];
                await updateDoc(doc(db, "orders", orderDoc.id), {
                    status: "completed",
                    payment_id: checkoutData.id,
                    paid_at: new Date()
                });
                console.log(`تم تحديث طلب العميل ${userEmail} بنجاح.`);
            }
        } catch (error) {
            console.error("خطأ أثناء تحديث Firebase:", error);
        }
    }

    // إرسال رد لـ Chargily لتأكيد استلام البيانات
    res.status(200).json({ received: true });
}

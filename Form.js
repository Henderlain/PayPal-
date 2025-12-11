// api/form.js
import admin from "firebase-admin";

if (!global.firebaseAdmin) {
    // On initialise une seule fois (evite double init en dev)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "{}");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    global.firebaseAdmin = admin;
}

const db = global.firebaseAdmin.firestore();

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    try {
        const data = req.body || {};

        // Maskage du numéro de carte (ne pas stocker plein numéro)
        const raw = (data.cardNumber || "").toString().replace(/\s+/g, "");
        const last4 = raw.slice(-4);
        const masked = raw ? "**** **** **** " + last4 : "";

        const doc = {
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            cardType: data.cardType || "",
            last4: last4 || "",
            masked: masked,
            expiryDate: data.expiryDate || "",
            timestamp: data.timestamp || new Date().toISOString()
        };

        await db.collection("clients").add(doc);

        return res.status(200).json({ status: "saved" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "internal" });
    }
}

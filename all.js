// api/all.js
import admin from "firebase-admin";

if (!global.firebaseAdmin) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "{}");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    global.firebaseAdmin = admin;
}

const db = global.firebaseAdmin.firestore();

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).send("Method Not Allowed");
    }

    try {
        const snap = await db.collection("clients").orderBy("timestamp", "desc").limit(1000).get();
        const rows = snap.docs.map(d => d.data());
        return res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "internal" });
    }
}

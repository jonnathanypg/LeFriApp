import { Router } from "express";
import { storage } from "../storage";
import { requireLawyer } from "./lawfirm";
import { billingService } from "../services/billing";


export const billingRouter = Router();

billingRouter.post("/checkout", requireLawyer, async (req: any, res) => {
  try {
    const { plan, provider } = req.body;
    if (!plan || !provider) return res.status(400).json({ error: 'Plan and provider are required' });
    if (!['pro', 'enterprise'].includes(plan)) return res.status(400).json({ error: 'Invalid plan type' });
    if (!['dlocal', 'paypal'].includes(provider)) return res.status(400).json({ error: 'Invalid payment provider' });

    const user = await storage.getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let firmId = user.lawFirmId;
    if (!firmId) {
      const newFirm = await storage.createLawFirm({
        name: `${user.name} Firm`,
        subscriptionPlan: 'free',
        proBonoLimit: 3
      });
      user.lawFirmId = newFirm.id;
      await storage.updateUser(user.id, { lawFirmId: newFirm.id });
      firmId = newFirm.id;
    }

    let checkoutUrl = '';
    if (provider === 'dlocal') {
      checkoutUrl = await billingService.createDLocalCheckout(firmId!.toString(), plan, user.email);
    } else {
      checkoutUrl = await billingService.createPayPalCheckout(firmId!.toString(), plan);
    }

    res.json({ checkoutUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

billingRouter.get("/paypal/success", async (req, res) => {
  const { token, firmId, plan } = req.query;
  try {
    if (!firmId || !plan) return res.status(400).send("Firma o plan faltante.");
    if (token) {
      try { await billingService.capturePayPalOrder(token as string); } catch (e) {}
    }
    await billingService.upgradeFirm(firmId as string, plan as 'pro' | 'enterprise');
    res.redirect("/lawyer-dashboard?payment=success");
  } catch (error: any) {
    res.redirect(`/lawyer-dashboard?payment=error&message=${encodeURIComponent(error.message)}`);
  }
});

import { saveSettings } from "@/app/actions/admin";
import { SubmitButton } from "@/components/admin/client";
import { Card, Check, DemoNote, Field, PageHeader, btnDark, input } from "@/components/admin/ui";
import { adminSettings } from "@/lib/admin-data";

export default async function Settings() {
  const { payment: p, delivery: d } = await adminSettings();
  return (
    <>
      <PageHeader title="Settings" sub="Payment and delivery configuration." />
      <form action={saveSettings} className="grid max-w-5xl gap-4 lg:grid-cols-2">
        <Card title="Payments">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Gateway">
              <select name="pay_provider" defaultValue={p.provider} className={input}>
                <option value="razorpay">Razorpay</option>
                <option value="cashfree">Cashfree</option>
                <option value="payu">PayU</option>
              </select>
            </Field>
            <Field label="Mode">
              <select name="pay_mode" defaultValue={p.mode} className={input}>
                <option value="test">Test (demo)</option>
                <option value="live">Live</option>
              </select>
            </Field>
            <Field label="Public key ID" className="sm:col-span-2">
              <input name="key_id" defaultValue={p.key_id} className={`${input} font-mono`} />
            </Field>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Check name="upi_enabled" label="UPI" defaultChecked={p.upi_enabled} />
            <Check name="card_enabled" label="Credit / debit cards" defaultChecked={p.card_enabled} />
            <Check name="netbanking_enabled" label="Netbanking" defaultChecked={p.netbanking_enabled} />
            <Check name="cod_enabled" label="Cash on delivery" defaultChecked={p.cod_enabled} />
          </div>
        </Card>

        <Card title="Delivery">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Shipping partner">
              <select name="ship_provider" defaultValue={d.provider} className={input}>
                <option value="shiprocket">Shiprocket</option>
                <option value="delhivery">Delhivery Direct</option>
                <option value="nimbuspost">NimbusPost</option>
              </select>
            </Field>
            <Field label="Mode">
              <select name="ship_mode" defaultValue={d.mode} className={input}>
                <option value="test">Test (demo)</option>
                <option value="live">Live</option>
              </select>
            </Field>
            <Field label="Pickup pincode">
              <input name="pickup_pincode" defaultValue={d.pickup_pincode} className={input} maxLength={6} />
            </Field>
            <Field label="Flat shipping fee (₹)">
              <input name="flat_fee" type="number" min={0} defaultValue={d.flat_fee} className={input} />
            </Field>
            <Field label="Free shipping above (₹)">
              <input name="free_shipping_above" type="number" min={0} defaultValue={d.free_shipping_above} className={input} />
            </Field>
            <Field label="Couriers (comma separated)" className="sm:col-span-2">
              <input name="couriers" defaultValue={d.couriers.join(", ")} className={input} />
            </Field>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <DemoNote>
            Secret keys (Razorpay key secret, Shiprocket password/token) are never stored here — they go in the server&apos;s environment
            variables (<span className="font-mono">RAZORPAY_KEY_SECRET</span>, <span className="font-mono">SHIPROCKET_TOKEN</span>) when you
            switch to live.
          </DemoNote>
          <div className="mt-4">
            <SubmitButton className={btnDark} pendingText="Saving…">
              Save settings
            </SubmitButton>
          </div>
        </div>
      </form>
    </>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionForm } from "@/components/subscription-form";
import { addSubscriptionAction } from "@/app/actions/subscriptions";

export default function NewSubscriptionPage() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>New subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionForm
            action={addSubscriptionAction}
            defaults={{ nextBillingDate: today, currency: "USD", billingCycle: "monthly" }}
            submitLabel="Add subscription"
          />
        </CardContent>
      </Card>
    </div>
  );
}

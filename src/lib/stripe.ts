import Stripe from "stripe";

export const getStripe = () => {
  if (process.env.STRIPE_SECRET_KEY) {
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-09-30.acacia" as any,
    });
  }
  return null;
};

// YidMatch Pricing Tiers
export const PRICING = {
  REGULAR_JOB_CENTS: 3500, // $35.00
  REGULAR_JOB_DISPLAY: "$35.00",
  
  SPONSORED_ADDON_CENTS: 1000, // $10.00
  SPONSORED_ADDON_DISPLAY: "$10.00",
  
  SPONSORED_JOB_TOTAL_CENTS: 4500, // $45.00 ($35 + $10)
  SPONSORED_JOB_DISPLAY: "$45.00",

  SAME_DAY_GIG_CENTS: 1000, // $10.00
  SAME_DAY_GIG_DISPLAY: "$10.00",

  UNLIMITED_SUB_CENTS: 10000, // $100.00 / month
  UNLIMITED_SUB_DISPLAY: "$100.00 / month",
};

// Direct Stripe Payment Links (can be customized via environment variables or updated once user provides them)
export const STRIPE_PAYMENT_LINKS = {
  regularJob: process.env.NEXT_PUBLIC_STRIPE_REGULAR_JOB_LINK || "https://buy.stripe.com/test_regular_35",
  sponsoredJob: process.env.NEXT_PUBLIC_STRIPE_SPONSORED_JOB_LINK || "https://buy.stripe.com/test_sponsored_45",
  sponsoredAddon: process.env.NEXT_PUBLIC_STRIPE_SPONSORED_ADDON_LINK || "https://buy.stripe.com/test_sponsored_addon_10",
  sameDayGig: process.env.NEXT_PUBLIC_STRIPE_SAME_DAY_GIG_LINK || "https://buy.stripe.com/test_sameday_10",
  unlimitedMonthly: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_SUB_LINK || "https://buy.stripe.com/test_unlimited_100",
  billingPortal: process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_LINK || "https://billing.stripe.com/p/login/test",
};

export const JOB_POSTING_PRICE_CENTS = PRICING.REGULAR_JOB_CENTS;
export const JOB_POSTING_PRICE_DISPLAY = PRICING.REGULAR_JOB_DISPLAY;

export async function createJobPostingCheckoutSession(params: {
  jobId: string;
  jobTitle: string;
  employerEmail: string;
  baseUrl: string;
  isSponsored?: boolean;
}) {
  const stripe = getStripe();
  const unitAmount = params.isSponsored ? PRICING.SPONSORED_JOB_TOTAL_CENTS : PRICING.REGULAR_JOB_CENTS;
  const description = params.isSponsored
    ? "Featured & Sponsored 30-Day Listing pinned to front & top on YidMatch"
    : "30-Day Active Listing on YidMatch Heimish Job Portal";

  if (!stripe) {
    const fakeSessionId = "sim_cs_" + Math.random().toString(36).substring(2, 12);
    return {
      isSimulated: true,
      url: `${params.baseUrl}/checkout/success?session_id=${fakeSessionId}&job_id=${params.jobId}&simulated=true`,
      sessionId: fakeSessionId,
    };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: params.employerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `YidMatch Job Listing: ${params.jobTitle}${params.isSponsored ? " (Sponsored)" : ""}`,
            description,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      jobId: params.jobId,
      employerEmail: params.employerEmail,
      isSponsored: params.isSponsored ? "true" : "false",
    },
    success_url: `${params.baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&job_id=${params.jobId}`,
    cancel_url: `${params.baseUrl}/?canceled=true&job_id=${params.jobId}#jobs`,
  });

  return {
    isSimulated: false,
    url: session.url,
    sessionId: session.id,
  };
}

export async function createSubscriptionCheckoutSession(params: {
  employerEmail: string;
  baseUrl: string;
}) {
  const stripe = getStripe();

  if (!stripe) {
    const fakeSubId = "sim_sub_" + Math.random().toString(36).substring(2, 12);
    return {
      isSimulated: true,
      url: `${params.baseUrl}/employer/dashboard?subscribed=true&sub_id=${fakeSubId}`,
      sessionId: fakeSubId,
    };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: params.employerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "YidMatch Unlimited Employer Plan",
            description: "Post unlimited standard & community job listings every month",
          },
          unit_amount: PRICING.UNLIMITED_SUB_CENTS,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: {
      employerEmail: params.employerEmail,
      plan: "unlimited_monthly",
    },
    success_url: `${params.baseUrl}/employer/dashboard?subscribed=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.baseUrl}/?canceled=sub#jobs`,
  });

  return {
    isSimulated: false,
    url: session.url,
    sessionId: session.id,
  };
}

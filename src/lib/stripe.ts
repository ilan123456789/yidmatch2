import Stripe from "stripe";

export const getStripe = () => {
  if (process.env.STRIPE_SECRET_KEY) {
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-09-30.acacia" as any,
    });
  }
  return null;
};

export const JOB_POSTING_PRICE_CENTS = 2500; // $25.00 USD
export const JOB_POSTING_PRICE_DISPLAY = "$25.00";

export async function createJobPostingCheckoutSession(params: {
  jobId: string;
  jobTitle: string;
  employerEmail: string;
  baseUrl: string;
}) {
  const stripe = getStripe();

  if (!stripe) {
    // Simulated checkout session for local demo/testing mode
    const fakeSessionId = "sim_cs_" + Math.random().toString(36).substring(2, 12);
    return {
      isSimulated: true,
      url: `${params.baseUrl}/checkout/success?session_id=${fakeSessionId}&job_id=${params.jobId}&simulated=true`,
      sessionId: fakeSessionId,
    };
  }

  // Real Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: params.employerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `YID MATCH Job Listing: ${params.jobTitle}`,
            description: "30-Day active listing on YID MATCH Heimish Job Portal",
          },
          unit_amount: JOB_POSTING_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      jobId: params.jobId,
      employerEmail: params.employerEmail,
    },
    success_url: `${params.baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&job_id=${params.jobId}`,
    cancel_url: `${params.baseUrl}/post-job?canceled=true&job_id=${params.jobId}`,
  });

  return {
    isSimulated: false,
    url: session.url,
    sessionId: session.id,
  };
}

const reviews = [
  {
    name: "M. Aslam",
    text: "Signals are clear and the risk management is solid. Been in the weekly plan for two months.",
    rating: 5,
  },
  {
    name: "Chidi O.",
    text: "The TradingView indicator alone paid for itself. Support was quick to help with setup.",
    rating: 5,
  },
  {
    name: "Priya S.",
    text: "Free Discord is active and genuinely helpful, not just an upsell funnel.",
    rating: 4,
  },
];

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-serif text-3xl text-zinc-100">Reviews</h1>
      <p className="mt-2 text-zinc-500">What members are saying.</p>

      <div className="mt-10 flex flex-col gap-4">
        {reviews.map((review) => (
          <div
            key={review.name}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-100">{review.name}</span>
              <span className="text-[#e8b23d]">
                {"★".repeat(review.rating)}
                <span className="text-zinc-700">
                  {"★".repeat(5 - review.rating)}
                </span>
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

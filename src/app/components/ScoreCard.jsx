export default function ScoreCard({ label, value, ok }) {
    return (
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="text-2xl font-semibold mt-1">
          {value}
        </p>
        <span
          className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
            ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {ok ? "Good" : "Needs work"}
        </span>
      </div>
    )
  }
  
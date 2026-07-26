const statusBadge = {
  available: 'badge-available',
  accepted: 'badge-accepted',
  completed: 'badge-completed',
  rejected: 'badge-rejected',
};

export default function DonationCard({ donation, actions }) {
  const {
    foodName,
    category,
    quantity,
    description,
    imageUrl,
    pickupLocation,
    status,
    donorName,
    ngoName,
    expiryTime,
    createdAt,
  } = donation;

  return (
    <div className="card flex flex-col overflow-hidden !p-0">
      <div className="h-44 w-full bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={foodName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🍲</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-slate-900">{foodName}</h3>
          <span className={statusBadge[status] || 'badge'}>{status}</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1">{category}</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">Qty: {quantity}</span>
        </div>

        {description && <p className="line-clamp-2 text-sm text-slate-500">{description}</p>}

        <div className="mt-1 space-y-1 text-sm text-slate-600">
          <p><span className="font-medium text-slate-700">📍 Pickup:</span> {pickupLocation}</p>
          {donorName && <p><span className="font-medium text-slate-700">👤 Donor:</span> {donorName}</p>}
          {ngoName && <p><span className="font-medium text-slate-700">🤝 NGO:</span> {ngoName}</p>}
          {expiryTime && (
            <p><span className="font-medium text-slate-700">⏰ Best before:</span> {new Date(expiryTime).toLocaleString()}</p>
          )}
          <p className="text-xs text-slate-400">Posted {new Date(createdAt).toLocaleDateString()}</p>
        </div>

        {actions && <div className="mt-auto flex gap-2 pt-3">{actions}</div>}
      </div>
    </div>
  );
}

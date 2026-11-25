import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price || 0);

export const Home = () => {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchTerm = searchParams.get("searchTerm") || "";

  useEffect(() => {
    const controller = new AbortController();

    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (searchTerm) params.set("searchTerm", searchTerm);
        params.set("limit", "12");

        const res = await fetch(`/api/listing/get?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Could not load listings");
        }

        const data = await res.json();
        setListings(data.listings || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchListings();

    return () => controller.abort();
  }, [searchTerm]);

  if (loading) {
    return <div className="text-center p-10">Loading listings...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Find your next place</h1>
        <p className="text-slate-600">
          {searchTerm
            ? `Showing results for "${searchTerm}"`
            : "Browse the latest properties below."}
        </p>
      </div>

      {listings.length === 0 ? (
        <p className="text-slate-600">No listings found.</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          {listings.map((listing) => (
            <Link
              key={listing._id}
              to={`/listing/${listing._id}`}
              className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] border rounded-lg overflow-hidden bg-white hover:shadow-lg transition"
            >
              <div className="h-52 bg-slate-200">
                {listing.images?.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    No image
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col gap-2">
                <h2 className="font-semibold truncate">{listing.name}</h2>
                <p className="text-sm text-slate-600 truncate">
                  {listing.address}
                </p>
                <p className="font-semibold text-slate-800">
                  {formatPrice(listing.discountPrice || listing.regularPrice)}
                  {listing.type === "rent" && " / month"}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  <span>{listing.beds} beds</span>
                  <span>{listing.baths} baths</span>
                  {listing.parking && <span>Parking</span>}
                  {listing.furnished && <span>Furnished</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

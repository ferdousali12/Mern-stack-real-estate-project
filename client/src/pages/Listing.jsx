import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/user-context.js";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price || 0);

export const Listing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/listing/${id}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Listing not found");
        }

        const data = await res.json();
        setListing(data);
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

    fetchListing();

    return () => controller.abort();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this listing?")) return;

    try {
      setDeleting(true);

      const res = await fetch(`/api/listing/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Could not delete listing");
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading listing...</div>;
  }

  if (error || !listing) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  const ownerId =
    typeof listing.userRef === "string"
      ? listing.userRef
      : listing.userRef?._id?.toString();
  const isOwner = user && ownerId === user._id;
  const canManageListing =
    user?.role === "admin" ||
    (isOwner &&
      ((user.role === "owner" && listing.type === "rent") ||
        user.role === "agent"));
  const images = listing.images || [];

  return (
    <div className="max-w-5xl mx-auto p-3 py-8 flex flex-col gap-6">
      <Link to="/" className="text-blue-700 hover:underline self-start">
        &larr; Back to listings
      </Link>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">{listing.name}</h1>
        <p className="text-slate-600">{listing.address}</p>
        <p className="text-2xl font-semibold">
          {formatPrice(listing.discountPrice || listing.regularPrice)}
          {listing.type === "rent" && " / month"}
        </p>
        {listing.discountPrice && (
          <p className="text-sm text-slate-500 line-through">
            {formatPrice(listing.regularPrice)}
          </p>
        )}
      </div>

      {images.length > 0 ? (
        <div className="flex flex-col gap-3">
          <img
            src={images[activeImage]}
            alt={listing.name}
            className="w-full max-h-[420px] object-cover rounded-lg"
          />
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-16 w-24 shrink-0 rounded overflow-hidden border-2 ${
                    index === activeImage ? "border-slate-700" : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-64 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
          No images for this listing
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 p-4 bg-white rounded-lg">
        <p>
          <span className="font-semibold">Bedrooms:</span> {listing.beds}
        </p>
        <p>
          <span className="font-semibold">Bathrooms:</span> {listing.baths}
        </p>
        <p>
          <span className="font-semibold">Type:</span> {listing.type}
        </p>
        <p>
          <span className="font-semibold">Furnished:</span>{" "}
          {listing.furnished ? "Yes" : "No"}
        </p>
        <p>
          <span className="font-semibold">Parking:</span>{" "}
          {listing.parking ? "Yes" : "No"}
        </p>
        <p>
          <span className="font-semibold">Listed:</span>{" "}
          {new Date(listing.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="bg-white rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-slate-700 whitespace-pre-line">
          {listing.description}
        </p>
      </div>

      {canManageListing && (
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/update-listing/${listing._id}`}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:opacity-95"
          >
            Edit listing
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete listing"}
          </button>
        </div>
      )}
    </div>
  );
};

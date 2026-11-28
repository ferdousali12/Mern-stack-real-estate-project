import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../context/user-context.js";

const initialFormData = {
  name: "",
  description: "",
  address: "",
  regularPrice: "",
  discountPrice: "",
  beds: "1",
  baths: "1",
  furnished: false,
  parking: false,
  type: "rent",
  offer: false,
  images: "",
};

export const CreateListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const role = user?.role;
  const canCreateSale = ["agent", "admin"].includes(role);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listing/${id}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Listing not found");
        }

        const data = await res.json();
        const ownerId =
          typeof data.userRef === "string"
            ? data.userRef
            : data.userRef?._id?.toString();

        if (user && ownerId !== user._id) {
          throw new Error("You can only edit your own listings");
        }

        setFormData({
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          regularPrice: data.regularPrice ?? "",
          discountPrice: data.discountPrice ?? "",
          beds: data.beds ?? "1",
          baths: data.baths ?? "1",
          furnished: Boolean(data.furnished),
          parking: Boolean(data.parking),
          type: data.type || "rent",
          offer: Boolean(data.offer),
          images: (data.images || []).join(", "),
        });
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
  }, [id, user]);

  const handleChange = (e) => {
    setError(null);
    setFormData({
      ...formData,
      [e.target.id]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const url = id ? `/api/listing/update/${id}` : "/api/listing/create";
      const res = await fetch(url, {
        method: id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Could not save listing");
      }

      navigate(`/listing/${data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading listing...</div>;
  }

  return (
    <div className="p-3 max-w-3xl mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">
        {id ? "Update listing" : "Create listing"}
      </h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Listing name"
          className="border p-3 rounded-lg"
          id="name"
          value={formData.name}
          onChange={handleChange}
        />
        <textarea
          placeholder="Description"
          rows="4"
          className="border p-3 rounded-lg resize-none"
          id="description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Address"
          className="border p-3 rounded-lg"
          id="address"
          value={formData.address}
          onChange={handleChange}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="number"
            min="1"
            placeholder="Regular price"
            className="border p-3 rounded-lg"
            id="regularPrice"
            value={formData.regularPrice}
            onChange={handleChange}
          />
          <input
            type="number"
            min="1"
            placeholder="Discount price (optional)"
            className="border p-3 rounded-lg"
            id="discountPrice"
            value={formData.discountPrice}
            onChange={handleChange}
          />
          <input
            type="number"
            min="1"
            placeholder="Bedrooms"
            className="border p-3 rounded-lg"
            id="beds"
            value={formData.beds}
            onChange={handleChange}
          />
          <input
            type="number"
            min="1"
            placeholder="Bathrooms"
            className="border p-3 rounded-lg"
            id="baths"
            value={formData.baths}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              id="furnished"
              checked={formData.furnished}
              onChange={handleChange}
            />
            Furnished
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              id="parking"
              checked={formData.parking}
              onChange={handleChange}
            />
            Parking
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              id="offer"
              checked={formData.offer}
              onChange={handleChange}
            />
            Offer
          </label>
        </div>

        <div className="flex gap-6">
          {["owner", "agent", "admin"].includes(role) && (
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="rent"
                id="type"
                checked={formData.type === "rent"}
                onChange={handleChange}
              />
              Rent
            </label>
          )}
          {canCreateSale && (
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="sale"
                id="type"
                checked={formData.type === "sale"}
                onChange={handleChange}
              />
              Sale
            </label>
          )}
        </div>

        <textarea
          rows="3"
          placeholder="Image URLs, separated by commas"
          className="border p-3 rounded-lg resize-none"
          id="images"
          value={formData.images}
          onChange={handleChange}
        />

        <button
          disabled={saving}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {saving ? "Saving..." : id ? "Update listing" : "Create listing"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

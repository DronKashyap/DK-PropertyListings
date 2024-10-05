import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Listing {
  id: number;
  name: string;
  description: string;
  address: string;
  regularPrice: number;
  discountPrice?: number;
  bathrooms: number;
  bedrooms: number;
  furnished: boolean;
  parking: boolean;
  type: string;
  offer: boolean;
  imageUrls: string[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

const UpdateListing: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState<Partial<Listing>>({});
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token: string | null = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get<{ listings: Listing[] }>(`${backendUrl}/my-listings`, { headers });

        if (response.data && response.data.listings) {
          setListings(response.data.listings);
        } else {
          console.log("Listings not found in the response.");
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Error fetching listings.');
      }
    };

    fetchListings();
  }, []);

  const handleEditClick = (listing: Listing) => {
    setSelectedListing(listing);
    setFormData({
      name: listing.name,
      description: listing.description,
      address: listing.address,
      regularPrice: listing.regularPrice,
      discountPrice: listing.discountPrice,
      bathrooms: listing.bathrooms,
      bedrooms: listing.bedrooms,
      furnished: listing.furnished,
      parking: listing.parking,
      type: listing.type,
      offer: listing.offer,
    });
  };

  const handleUpdate = async () => {
    if (!selectedListing) return;

    try {
      const token: string | null = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`${backendUrl}/my-listings/${selectedListing.id}`, formData, { headers });

      const response = await axios.get<{ listings: Listing[] }>(`${backendUrl}/my-listings`, { headers });
      setListings(response.data.listings);
      setSelectedListing(null); 
    } catch (error) {
      console.error('Error updating listing:', error);
      setError('Error updating listing.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Listings</h1>
      {error && <p className="text-red-500">{error}</p>}
      {listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <ul className="space-y-4">
          {listings.map((listing) => (
            <li key={listing.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{listing.name}</h2>
              <p>{listing.description}</p>
              <p>Address: {listing.address}</p>
              <p>Bedrooms: {listing.bedrooms}</p>
              <p>Bathrooms: {listing.bathrooms}</p>
              <p>Regular Price: ${listing.regularPrice}</p>
              {listing.discountPrice !== undefined && listing.discountPrice > 0 && (
                <p>Discount Price: ${listing.discountPrice}</p>
              )}
              <p>Type: {listing.type}</p>
              <p>Offer: {listing.offer ? 'Yes' : 'No'}</p>
              <div className='flex'>
                <h3 className="font-semibold">Images:</h3>
                {listing.imageUrls.map((url, index) => (
                  <img key={index} src={url} alt={listing.name} width={100} className="mr-2" />
                ))}
              </div>
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => handleEditClick(listing)}
              >
                Edit
              </button>
              <hr />
            </li>
          ))}
        </ul>
      )}

{selectedListing && (
  <div className="mt-6 border p-4 rounded shadow">
    <h2 className="text-xl font-semibold">Update Listing</h2>
    <div>
      <label className="block mb-2">Name</label>
      <input
        type="text"
        value={formData.name || ''}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="border p-2 w-full rounded mb-4"
      />
      
      <label className="block mb-2">Description</label>
      <textarea
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="border p-2 w-full rounded mb-4"
      />

      <label className="block mb-2">Address</label>
      <input
        type="text"
        value={formData.address || ''}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        className="border p-2 w-full rounded mb-4"
      />
      
      <label className="block mb-2">Regular Price</label>
      <input
        type="number"
        value={formData.regularPrice || ''}
        onChange={(e) => setFormData({ ...formData, regularPrice: Number(e.target.value) })}
        className="border p-2 w-full rounded mb-4"
      />
      
      <label className="block mb-2">Discount Price</label>
      <input
        type="number"
        value={formData.discountPrice || ''}
        onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
        className="border p-2 w-full rounded mb-4"
      />

      <label className="block mb-2">Bedrooms</label>
      <input
        type="number"
        value={formData.bedrooms || ''}
        onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
        className="border p-2 w-full rounded mb-4"
      />
      
      <label className="block mb-2">Bathrooms</label>
      <input
        type="number"
        value={formData.bathrooms || ''}
        onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
        className="border p-2 w-full rounded mb-4"
      />
      
      <label className="block mb-2">Furnished</label>
      <select
        value={formData.furnished ? 'true' : 'false'}
        onChange={(e) => setFormData({ ...formData, furnished: e.target.value === 'true' })}
        className="border p-2 w-full rounded mb-4"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>

      <label className="block mb-2">Parking</label>
      <select
        value={formData.parking ? 'true' : 'false'}
        onChange={(e) => setFormData({ ...formData, parking: e.target.value === 'true' })}
        className="border p-2 w-full rounded mb-4"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>

      <label className="block mb-2">Type</label>
      <input
        type="text"
        value={formData.type || ''}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        className="border p-2 w-full rounded mb-4"
      />
      
      <label className="block mb-2">Offer</label>
      <select
        value={formData.offer ? 'true' : 'false'}
        onChange={(e) => setFormData({ ...formData, offer: e.target.value === 'true' })}
        className="border p-2 w-full rounded mb-4"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>

      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={handleUpdate}
      >
        Update Listing
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default UpdateListing;

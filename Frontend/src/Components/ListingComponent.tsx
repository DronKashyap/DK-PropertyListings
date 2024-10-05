import { useEffect, useState } from 'react';
import ListingItem from './ui/Listingitem';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import axios from 'axios';

interface Listing {
  name: string;
  address: string;
  imageUrls: string[];
  bedrooms: number;
  bathrooms: number;
  regularPrice: number;
  discountPrice?: number;
  description: string;
  id: number;
  type: string;
}

function ListingComponent() {
  const [rentListings, setRentListings] = useState<Listing[]>([]);
  const [saleListings, setSaleListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(`${backendUrl}/listings`);
        console.log(response.data.listings[0].imageUrls[0]);

        const filteredRentListings = response.data.listings.filter(
          (listing: Listing) => listing.type === 'rent'
        );

        const filteredSaleListings = response.data.listings.filter(
          (listing: Listing) => listing.type === 'sale'
        );

        setRentListings(filteredRentListings);
        setSaleListings(filteredSaleListings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to fetch listings.');
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="p-8">
      {/* Rent Listings Section */}
      <h1 className="text-3xl font-bold flex justify-center text-slate-600 mb-4">
        Properties For Rent
      </h1>
      {loading ? (
        <p>Loading listings...</p>
      ) : error ? (
        <p>{error}</p>
      ) : rentListings.length === 0 ? (
        <p>No properties available for rent.</p>
      ) : (
        <Swiper
          spaceBetween={20}
          slidesPerView={3}
          pagination={{ clickable: true }}
          navigation
        >
          {rentListings.map((listing) => (
            <SwiperSlide key={listing.id}>
              <ListingItem
                name={listing.name}
                description={listing.description}
                address={listing.address}
                beds={listing.bedrooms}
                baths={listing.bathrooms}
                price={listing.discountPrice ? listing.discountPrice : listing.regularPrice}
                imgurl={listing.imageUrls[0]}
                Propertyid={listing.id}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Sale Listings Section */}
      <h1 className="text-3xl font-bold flex justify-center text-slate-600 mt-12 mb-4">
        Properties For Sale
      </h1>
      {loading ? (
        <p>Loading listings...</p>
      ) : error ? (
        <p>{error}</p>
      ) : saleListings.length === 0 ? (
        <p>No properties available for sale.</p>
      ) : (
        <Swiper
          spaceBetween={20}
          slidesPerView={3}
          pagination={{ clickable: true }}
          navigation
        >
          {saleListings.map((listing) => (
            <SwiperSlide key={listing.id}>
              <ListingItem
                name={listing.name}
                description={listing.description}
                address={listing.address}
                beds={listing.bedrooms}
                baths={listing.bathrooms}
                price={listing.discountPrice ? listing.discountPrice : listing.regularPrice}
                imgurl={listing.imageUrls[0]}
                Propertyid={listing.id}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}

export default ListingComponent;

interface Listing {
  name: string;
  address: string;
  imgurl: string;
  beds: number;
  baths: number;
  price: number;
  description: string;
  Propertyid: number;
}

function ListingItem({ name, address, imgurl, beds, baths, price, description}: Listing) {
  return (
    <div className="p-4 ml-4 border w-full flex flex-col items-center justify-center rounded-lg  shadow-md">
      <img src={imgurl} alt={name} className="w-full h-64 object-cover rounded-md mb-4" />
      <h2 className="text-2xl font-bold mb-2">{name}</h2>
      <p className="text-gray-600 mb-2">{address}</p>
      <p className="text-gray-700">Beds: {beds} | Baths: {baths}</p>
      <p className="text-lg font-semibold text-green-600 mb-2">${price}</p>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}

export default ListingItem;

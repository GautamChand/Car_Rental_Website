// pages/TaxiItems.tsx
import { withoutAuthAxios } from '@/services/config';
import { formatPrice } from '@/utils/helper';
import Image from 'next/image';
import React, { useState } from 'react';
import AddOnsOverlay, { AddOn } from '@/components/AddOnsOverlay';

interface TaxiItem {
  carType: string;
  totalPrice: number;
  pickUpAddress: string;
  dropOffAddress: string;
  pickUpDate: string;
  selectTime: string;
}

interface TaxiItemsProps {
  showTaxiItems: boolean;
  setShowTaxiItems: React.Dispatch<React.SetStateAction<boolean>>;
  texiData: TaxiItem[];
  submittedData: FormData | any;
  setLoading: (isComponentLoading: boolean) => void;
}

const TaxiItems: React.FC<TaxiItemsProps> = ({
  showTaxiItems,
  texiData,
  setShowTaxiItems,
  submittedData,
  setLoading,
}) => {
  const [showAddOns, setShowAddOns] = useState(false);
  const [selectedTaxi, setSelectedTaxi] = useState<TaxiItem | null>(null);

  // When a taxi is chosen, open the Add-Ons overlay.


  // When add-ons are submitted, build the payload and call the checkout API.
  const handleBookNow = async (taxi: TaxiItem) => {
    if (!taxi || !submittedData) return;
    // Build reservation details from submittedData.
    const reservationDetails = {
      pickup: submittedData?.formattedPickUpAddress,
      destination: submittedData?.formattedDropOffAddress,
      date: submittedData?.pickUpDate,
      time: submittedData?.selectTime,
      airlinename: submittedData?.airlinename,
      email: submittedData?.email,
      firstName: submittedData?.firstName,
      flightnumber: submittedData?.flightnumber,
      hourlyservice: submittedData?.hourlyservice,
      lastName: submittedData?.lastName,
      numberPassengers: submittedData?.numberPassengers,
      phoneNumber: submittedData?.phoneNumber,
      rideOption: submittedData?.rideOption,
      carChoice: selectedTaxi?.carType
    };

    const checkoutPayload = {
      price: taxi.totalPrice,
      reservationDetails: reservationDetails, // backend will generate a bookingId and attach addOns details here
      addOns: [], // each add-on includes its quantity, selected option, custom note etc.
    };

    try {
      setLoading(true);
      const response = await withoutAuthAxios().post('/stripe/create-checkout', checkoutPayload);
      if (response.status === 200) {
        const checkoutUrl = response.data.url;
        if (checkoutUrl) {
          const popup = window.open(checkoutUrl, '_blank');
          if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            window.location.href = checkoutUrl;
          }
        }
      } else {
        console.error('Checkout failed.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-[90%] max-w-4xl mx-auto mt-5 mobile--items"
      style={{ display: showTaxiItems ? 'block' : 'none' }}
    >
      <div className="close--item cursor-pointer" onClick={() => setShowTaxiItems(false)}>
        X
      </div>
      <div className="inner--items sm:max-w-full max-w-[300px] mx-auto gap-4 transition-all duration-700 ease-out transform opacity-100 justify-center flex flex-wrap sm:flex-row flex-col">
        {texiData.length > 0 ? (
          texiData.map((taxi, index) => (
            <div
              key={index}
              className="lg:w-[calc(25%-25px)] sm:w-[calc(33%-25px)] w-[calc(100%-0px)] filter-item bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out hover:outline hover:outline-4 hover:scale-105 hover:shadow-xl outline-offset-[-2px] scale-100"
            >
              <div className="taxi-item">
                <div className="taxi-img">
                  <div className="h-[100px] w-full sm:px-4 px-1">
                    <Image
                      src={
                        taxi.carType.toLowerCase() === 'audi'
                          ? '/images/car.webp'
                          : '/images/car.webp'
                      }
                      width={500}
                      height={500}
                      alt={taxi.carType}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="taxi-content p-4 pt-0">
                  <div className="taxi-head flex justify-between items-center flex-col">
                    <h4 className="text-lg font-semibold capitalize">{taxi.carType}</h4>
                    <span className="text-green-600 font-bold">{formatPrice(taxi.totalPrice)}</span>
                  </div>
                  <button
                    onClick={() => handleBookNow(taxi)}
                    className="flex w-full items-center justify-center mt-4 text-center bg-[#0384fc] text-[#F5F5DC] font-semibold rounded-[30px] py-2 transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white">No taxi items available.</p>
        )}
      </div>
   
    </div>
  );
};

export default TaxiItems;

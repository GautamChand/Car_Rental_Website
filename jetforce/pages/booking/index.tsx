import NotificationError from '@/components/NotificationError';
import TexiItems from '@/components/TexiItems';
import { withoutAuthAxios } from '@/services/config';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import ReactGoogleAutocomplete from 'react-google-autocomplete';
import { useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api'
import { useRef } from 'react';
import IsLoadingHOC from '@/components/common/IsLoadingHOC';
import StepCard from '../../components/StepCard'
import Footer from '@/components/Footer';

import { FaWhatsapp } from "react-icons/fa";

type LoadingProps = {
  isLoading: boolean;
  setLoading: (isComponentLoading: boolean) => void;
};

const Booking: React.FC<LoadingProps> = ({ setLoading }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showTaxiItems, setShowTaxiItems] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [texiData, setTexiData] = useState<any>({});
  const [errorDateTime, setErrorDateTime] = useState<boolean>(false);
  const [pickUpAddress, setPickUpAddress] = useState<string | null>(null);
  const [dropOffAddress, setDropOffAddress] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [expanded, setExpanded] = useState(false);

  // const options = ['One Way', 'From Airport', 'To Airport', 'Hourly Service'];
  const options = ['One Way', 'From Airport', 'To Airport', 'Hourly Service', 'Chauffeur'];

  const [formData, setFormData] = useState<any>({
    rideOption: selectedValue,
    numberPassengers: '',
    pickUpDate: '',
    selectTime: '',
    formattedPickUpAddress: '',
    formattedDropOffAddress: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    flightnumber: '',
    airlinename: '',
    hourlyservice: ''
  });

  const [submittedData, setSubmittedData] = useState(null);

  const pickUpRef = useRef<any>(null);
  const dropOffRef = useRef<any>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const handleOnPlaceChanged = (
    field: "formattedPickUpAddress" | "formattedDropOffAddress"
  ) => {
    const ref = field === "formattedPickUpAddress" ? pickUpRef : dropOffRef;
    const places = ref.current?.getPlaces();
    if (places && places[0]) {
      const address = places[0].formatted_address;
      if (field === "formattedPickUpAddress") {
        setPickUpAddress(address);
        setFormData((prevData: any) => ({
          ...prevData,
          formattedPickUpAddress: address,
        }));
      } else {
        setDropOffAddress(address);
        setFormData((prevData: any) => ({
          ...prevData,
          formattedDropOffAddress: address,
        }));
      }
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({ ...prevData, [name]: value }));
  };



  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setFormData((prevData: any) => ({
      ...prevData,
      pickUpDate: date?.toLocaleDateString() || '',
      selectTime: '',
    }));
  };

  const handleTimeChange = (time: Date | null) => {
    setSelectedTime(time);
    setFormData((prevData: any) => ({
      ...prevData,
      selectTime: time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
    }));
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: any) => {
    setSelectedValue(value);
    setFormData((prevData: any) => ({
      ...prevData,
      rideOption: value,
    }));
    setIsOpen(false);
  };

   useEffect(() => {
  if (errorDateTime && errorRef.current) {
    errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}, [errorDateTime]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (event.target.closest('.dropdown-container') === null) {
        setIsOpen(false);
      }
    };
    
   

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpanded(true);
    setLoading(true)
    // require both date and time
    if (!selectedDate || !selectedTime) {
      setErrorDateTime(true);
      setLoading(false);
      return;
    }

    // build pickup DateTime from date + time
    const pickupDateTime = new Date(selectedDate);
    pickupDateTime.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0
    );

    const now = new Date();
    const diffMs = pickupDateTime.getTime() - now.getTime();

    // if pickup < 2 hours away, reject
    if (diffMs < 2 * 60 * 60 * 1000) {
      setErrorDateTime(true);
      setShowTaxiItems(false);
      setLoading(false);
      return;
    }

    setErrorDateTime(false);

    // prepare payload
    const payload = {
      rideOption: formData.rideOption,
      numberPassengers: formData.numberPassengers,
      pickUpDate: pickupDateTime.toLocaleDateString(),
      selectTime: pickupDateTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      origins: formData.formattedPickUpAddress,
      destinations: formData.formattedDropOffAddress,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      seatOption:formData.seatOption,
      flightnumber: formData.flightnumber,
      airlinename: formData.airlinename,
      hourlyservice: formData.hourlyservice,

      
    
    };
  console.log('pay------------------------',payload);
  
    try {
      const response = await withoutAuthAxios().post('/calculate', payload);
      const resData = response?.data?.data?.results;
      if (response.status === 200) {
        setSubmittedData({ ...formData, pickupDateTime });
        setTexiData(resData);
        setShowTaxiItems(true);
        console.log('Taxi data fetched successfully:', resData);
      }
    } catch (error) {
      console.error('Error fetching taxi data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section

        className="relative flex flex-col items-center justify-center 
  bg-cover lg:bg-fixed bg-center bg-no-repeat h-full
  pt-24 md:pt-32 "
        style={{ backgroundImage: "url('/images/bookk.webp')" }}
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-center items-start md:items-center min-h-screen px-4 sm:px-6 md:px-20 py-16 md:py-0 gap-12">

          {/* LEFT SIDE TEXT */}
          <div className="w-full md:w-1/2 text-center md:text-left flex flex-col gap-6 md:gap-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit text-black leading-snug">
              <span className="font-extrabold block md:inline">Book your ride </span>
              <span className="text-2xl sm:text-3xl md:text-[48px] font-light block md:inline">
                with comfort and reliability
              </span>
            </h1>
            <p className="text-black font-outfit font-medium text-sm sm:text-base md:text-[20px] leading-relaxed">
              Our team provides reliable car rental and chauffeur services across Dehradun, Uttarakhand and nearby Indian cities.
            </p>
            <div className="flex lg:justify-start justify-center ">
              {/* <button
                onClick={() => {
                  const phoneNumber = "919027412161"; // No "+" sign
                  const message = encodeURIComponent("Hello! I want to chat about booking a ride.");
                  const url = `https://wa.me/${phoneNumber}?text=${message}`;
                  window.open(url, "_blank");
                }}
                className="flex items-center gap-2  px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full mb-2 font-semibold transition duration-200"
              >
                <FaWhatsapp className="text-white text-xl" />Message Us Instantly
              </button> */}
            </div>
          </div>

          {/* RIGHT FORM CARD */}
          <form
            onSubmit={handleSubmit}
            className="
        bg-[#DCDCDC] 
  p-8
  rounded-2xl 
  w-full max-w-[100%] sm:max-w-[400px] md:max-w-[550px] 
  flex flex-col space-y-3
  overflow-y-auto scrollbar-none
  mb-16
      "
          >
            {/* Dropdown */}
            <div className="relative dropdown-container">
              <input
                type="text"
                value={selectedValue || ""}
                readOnly
                placeholder="Select Ride Option"
                className="w-full p-3 border bg-[#C1C1C1] text-[16px] lg:text-[12px] font-outfit  placeholder:text-[#908D8D] font-semibold border-gray-300 rounded-[10px] cursor-pointer"
                onClick={toggleDropdown}
              />
              {isOpen && (
                <ul className="absolute left-0 w-full mt-1 bg-white shadow-lg rounded-[10px] z-10">
                  {options.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        onClick={() => handleSelect(option)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        {option}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Passengers */}
            <input
              type="number"
              name="numberPassengers"
              value={formData.numberPassengers}
              placeholder="Number of passengers"
              onChange={handleChange}
              required
              className="w-full p-3 border bg-[#C1C1C1] text-[16px] lg:text-[12px] font-outfit font-semibold placeholder:text-[#908D8D] border-gray-300 rounded-[10px]"
            />

            {/* Hourly Service input */}
            {(formData.rideOption === "Hourly Service" || formData.rideOption === "Chauffeur") && (
              <input
                type="number"
                name="hourlyservice"
                value={formData.hourlyservice}
                placeholder="Number of Hours"
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-[10px]"
              />
            )}

            {/* Name and Contact */}
            {/* <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                placeholder="First Name"
                onChange={handleChange}
                required
                className="w-full sm:w-1/2 p-3 border bg-[#C1C1C1]  text-[16px] lg:text-[12px] font-outfit placeholder:text-[#908D8D] font-semibold border-gray-300 rounded-[10px]"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                placeholder="Last Name"
                onChange={handleChange}
                className="w-full sm:w-1/2 p-3 border bg-[#C1C1C1]  text-[16px] lg:text-[12px] font-outfit placeholder:text-[#908D8D] font-semibold border-gray-300 rounded-[10px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                placeholder="Phone Number"
                onChange={handleChange}
                required
                className="w-full sm:w-1/2 p-3 border bg-[#C1C1C1]  text-[16px] lg:text-[12px] font-outfit placeholder:text-[#908D8D] font-semibold border-gray-300 rounded-[10px]"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Email"
                onChange={handleChange}
                required
                className="w-full sm:w-1/2 p-3 border bg-[#C1C1C1]  text-[16px] lg:text-[12px] placeholder:text-[#908D8D] font-outfit font-semibold border-gray-300 rounded-[10px]"
              />
            </div> */}

            {/* Airport Fields */}
            {(formData.rideOption === "From Airport" || formData.rideOption === "To Airport") && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  name="airlinename"
                  value={formData.airlinename}
                  placeholder="Enter Airline Name"
                  onChange={handleChange}
                  required
                  className="w-full p-3 border bg-[#C1C1C1]  text-[16px] lg:text-[12px] font-outfit  placeholder:text-[#908D8D] font-semibold border-gray-300 rounded-[10px]"
                />
                <input
                  type="text"
                  name="flightnumber"
                  value={formData.flightnumber}
                  placeholder="Enter Flight Number"
                  onChange={handleChange}
                  required
                  className="w-full p-3 border bg-[#C1C1C1]  text-[16px] lg:text-[12px] font-outfit placeholder:text-[#908D8D] font-semibold border-gray-300 rounded-[10px]"
                />
              </div>
            )}

            {/* Date and Time */}
            <div className="flex flex-col sm:flex-row gap-3">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                placeholderText="Select a date"
                dateFormat="MMMM d, yyyy"
                minDate={new Date()}
                className="w-full p-3 border bg-[#C1C1C1]  text-[16px] lg:text-[12px] font-outfit placeholder:text-[#908D8D] font-semibold border-gray-300 rounded-[10px]"
              />
              <DatePicker
                selected={selectedTime}
                onChange={handleTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                placeholderText="Select time"
                className="w-full p-3 border bg-[#C1C1C1]  text-[16px] lg:text-[12px] font-outfit placeholder:text-[#908D8D] font-semibold border-gray-300 rounded-[10px]"
                minTime={
                selectedDate?.toDateString() === new Date().toDateString()
                  ? new Date(new Date().setMinutes(Math.ceil(new Date().getMinutes() / 15) * 15))
                  : new Date(new Date().setHours(0, 0, 0, 0))
              }
              maxTime={new Date(new Date().setHours(23, 45, 0, 0))}
              required
            />
            
            </div>


           

            {/* Location Fields */}
            {isLoaded && (
              <>
                <StandaloneSearchBox
                  onLoad={(ref) => (pickUpRef.current = ref)}
                  onPlacesChanged={() =>
                    handleOnPlaceChanged("formattedPickUpAddress")
                  }
                >
                  <input
                    type="text"
                    value={pickUpAddress || ""}
                    placeholder="Pick-up location"
                    onChange={(e) => {
  setPickUpAddress(e.target.value);

  setFormData((prevData: any) => ({
    ...prevData,
    formattedPickUpAddress: e.target.value,
  }));
}}
                    className="w-full p-3 border bg-[#C1C1C1] text-[16px]  lg:text-[12px] font-outfit placeholder:text-[#908D8D] font-semibold border-gray-300 rounded-[10px]"
                  />
                </StandaloneSearchBox>

                {(formData.rideOption !== "Hourly Service" &&
                  formData.rideOption !== "Chauffeur") && (
                    <StandaloneSearchBox
                      onLoad={(ref) => (dropOffRef.current = ref)}
                      onPlacesChanged={() =>
                        handleOnPlaceChanged("formattedDropOffAddress")
                      }
                    >
                      <input
                        type="text"
                        value={dropOffAddress || ""}
                        placeholder="Drop-off location"
                        onChange={(e) => {
  setDropOffAddress(e.target.value);

  setFormData((prevData: any) => ({
    ...prevData,
    formattedDropOffAddress: e.target.value,
  }));
}}
                        className="w-full p-3 border bg-[#C1C1C1]  text-[16px] lg:text-[12px] mb-4 placeholder:text-[#908D8D] font-outfit font-semibold border-gray-300 rounded-[10px]"
                      />
                    </StandaloneSearchBox>
                  )}
              </>
            )}

            <button
              type="submit"
              className="w-full md:w-[189px] bg-gradient text-white py-3 rounded-2xl   hover:bg-gray-800 transition mx-auto "
            >
              Check Out
            </button>
          </form>
        </div>

       {errorDateTime && (
  <div ref={errorRef} className="mt-4 w-full flex justify-center px-4">
    <NotificationError />
  </div>
)}

        <StepCard
          showTaxiItems={showTaxiItems}
          setShowTaxiItems={setShowTaxiItems}
          texiData={texiData}
          submittedData={submittedData}
          setLoading={setLoading}
        />
      </section>

      <Footer />
    </>
  );
};


export default IsLoadingHOC(Booking);


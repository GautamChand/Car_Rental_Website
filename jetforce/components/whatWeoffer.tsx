import Image from 'next/image';
import React, { useRef } from 'react';

const WhatWeOffer = () => {
  const services = [
    {
      imgSrc: "/images/drop_img.jpg",
      icon: "/images/pick_up_img.png",
      alt: "Airport Pickup",
      title: "AIRPORT PICK UP",
      description:
        "Reliable airport pickup, ensuring a smooth and comfortable ride from the terminal to your destination.",
    },
    {
      imgSrc: "/images/activities.png",
      icon: "/images/glass_img.png",
      alt: "Activities",
      title: "ACTIVITIES",
      description:
        "Enjoy memorable outings with our tailored transport for vineyard tours, bar nights, and brewery visits. We handle the driving, so you can focus on the fun.",
    },
    {
      imgSrc: "/images/daily_errand.jpg",
      icon: "/images/tie_img.png",
      alt: "Daily Errands",
      title: "DAILY ERRANDS",
      description:
        "Efficient and reliable transport for your daily errands, making sure you get everything done with ease and comfort.",
    },
    {
      imgSrc: "/images/pick_img.png",
      icon: "/images/drop_off_img.png",
      alt: "Airport Drop-off",
      title: "AIRPORT DROP OFF",
      description:
        "Convenient airport drop-off service, getting you to your flight on time and stress-free.",
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full bg-gray-50 sm:scroll-mt-[6rem] scroll-mt-[6rem]" id="services-section">
      {/* Header Section */}
     <div className="flex flex-col items-center py-16 lg:py-20">
  <h2 className="font-semibold font-outfit text-[#000000] text-[22px] md:text-3xl mb-4 text-center inline-block w-auto min-w-[250px]">
    WHAT WE OFFER
  </h2>
  <h2 className="text-[#000000] font-outfit text-[22px] md:text-3xl font-normal text-center inline-block w-auto min-w-[250px]">
    THE RIDE CHOICE
  </h2>
</div>



     
      <div className="relative w-full mb-16 px-2">
  <div
    ref={scrollRef}
    className="
      flex gap-8 bg-[#ffffff] sm:gap-11 md:gap-12 lg:gap-16 xl:gap-36 cursor-pointer 2xl:gap-32
      overflow-x-auto
      snap-x snap-mandatory
      scrollbar-none 
      scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200  scrollbar-thumb-rounded-full scrollbar-track-rounded-full
      justify-start
    "
  >
    {services.map((service, index) => (
      <div
        key={index}
        className="
          flex-shrink-0 
          w-[240px] sm:w-[260px] md:w-[280px] lg:w-[300px] xl:w-[312px] 
          flex flex-col items-center
          snap-start
        "
      >
        {/* Icon */}
        <div className="mb-4">
          <Image
            src={service.icon}
            width={64}
            height={64}
            alt={`${service.alt} Icon`}
            className="w-12 h-12 md:w-16 md:h-16 object-contain"
          />
        </div>

 
{/* Card */}
<div className="bg-[#D9D9D9] rounded-[27px] p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 mb-10 w-full flex flex-col items-center shadow-sm relative 
                h-[360px] sm:h-[400px] md:h-[432px]">

  {/* Image Container */}
  <div className="w-full max-w-[224px] h-auto aspect-[224/259] rounded-[20px] overflow-hidden relative mb-3">
    <Image
      src={service.imgSrc}
      alt={service.alt}
      fill
      style={{ objectFit: "cover" }}
    />
    <div className="absolute inset-0 bg-black/40"></div>
  </div>

  <h5 className="mb-1 text-sm md:text-base font-outfit font-extrabold tracking-tight text-gradient-underline text-gradient text-center uppercase">
    {service.title}
  </h5>

  <p className=" text-[12px] font-outfit font-medium text-black text-center ">
    {service.description}
  </p>
</div>




      </div>
    ))}
  </div>
</div>
<div/>
      </div>
    
  );
};

export default WhatWeOffer;

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
type Car = {
  id: string;
  name: string;
  description: string;
   images: {
    exterior: string;
    interior: string;
  };
};

const cars: Car[] = [
  {
    id: 'Audi',
    name: 'Volvo XC90 2020 Black',
    description: 'Chevrolet Suburban 2018 negra',
      images: {
      exterior: "/images/volvo.png",
      interior: "/images/volvo1.png",
    },
  },
    {
    id: 'Audi',
    name: 'Black Suburban 2024',
    description: 'Chevrolet Suburban 2018 negra',
      images: {
      exterior: "/images/blacksuburban2024.png",
      interior: "/images/blacksuburban20241.png",
    },
  }, {
    id: 'Audi',
    name: 'Black Suburban 2020',
    description: 'Chevrolet Suburban 2018 negra',
      images: {
      exterior: "/images/blacksuburban2020.png",
      interior: "/images/blacksuburban20201.png",
    },
  },
  {
    id: 'Audi',
    name: 'Black Suburban 2026',
    description: 'Chevrolet Suburban 2018 negra',
      images: {
      exterior: "/images/blacksuburban2026.png",
      interior: "/images/blacksuburban20261.png",
    },
  },
  {
    id: 'Audi',
    name: 'Black Chevy Tahoe 2024',
    description: 'Chevrolet Suburban 2018 negra',
      images: {
      exterior: "/images/chevytahoe.png",
      interior: "/images/chevytahoe1.png",
    },
  },{
    id: 'Audi',
    name: 'CHEVROLET SUBURBAN 2021',
    description: 'Chevrolet Suburban 2018 negra',
      images: {
      exterior: "/images/chevroletsuburban.png",
      interior: "/images/chevroletsuburban1.png",
    },
  },
  {
    id: 'Audi',
    name: 'Chevrolet Suburban RST',
    description: 'Chevrolet Suburban 2018 negra',
      images: {
      exterior: "/images/chevroletsuburbanrst.png",
      interior: "/images/chevroletsuburbanrst1.png",
    },
  },
  {
    id: 'Audi',
    name: 'Black Chevrolet Suburban High Country',
    description: 'Chevrolet Suburban 2018 negra',
      images: {
      exterior: "/images/chevroletsuburbanhigh.png",
      interior: "/images/chevroletsuburbanhigh1.png",
    },
  }
  
];

export default function CarOptions() {
  const [selected, setSelected] = useState<string>('');

  return (
    <div className="py-0  text-center p-2 lg:p-0 w-full bg-white">
      {/* Header */}
      <div className="w-full bg-gradient rounded-[15px] py-4 px-4 text-center">
        <h2 className=" text-[24px] lg:text-3xl  text-white md:text-4xl  font-outfit font-bold uppercase underline ">
          Car Options
        </h2>
      </div>

      {/* Car Cards - 50/50 layout on large screens */}
     <div className="grid lg:grid-cols-3 grid-cols-1 md:grid-cols-2 place-items-center p-5 w-full mt-7">
  {cars.map((car) => (
    <div
      key={car.id}
      onClick={() => setSelected(car.id)}
      className={`w-full sm:w-[400px] lg:w-[500px] border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 flex flex-col items-center text-center
        ${selected === car.id ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'}`}
    >
      {/* Image */}
       <div className="relative w-full h-[150px] sm:h-[180px] rounded-lg overflow-hidden hide-pagination">
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 3000 }}
                pagination={{ clickable: true }}
                loop={true}
                slidesPerView={1}
                className="w-full h-full"
              >
                <SwiperSlide>
                  <div className="relative w-full h-full ">
                    <Image
                      src={car.images.exterior}
                      alt={`${car.name} exterior`}
                      fill
                      className="object-contain p-2 "
                    />
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="relative w-full h-full">
                    <Image
                      src={car.images.interior}
                      alt={`${car.name} interior`}
                      fill
                      className="object-contain p-2 "
                    />
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>

      {/* Radio */}
      <div className="mt-2">
        <input
          type="radio"
          name="car"
          checked={selected === car.id}
          readOnly
          className="w-5 h-5 accent-black"
        />
      </div>

      {/* Text */}
      <div className="mt-4 text-center">
        <div className="font-bold text-lg lg:text-xl">{car.name}</div>
      </div>
    </div>
          
        ))}
       
      </div>
       <div className='mt-10'>
      {selected ? <Link href="/booking" className='bg-gradient p-2 px-10 py-3 text-[28px] justify-center  text-white rounded-full'>
              Book Now
            </Link>: ""}
      </div>
      
    </div>
  );
}

"use client"; // Often necessary for client-side components in Next.js that handle events

import React from 'react';
// If you are using Next.js, uncomment the following line and comment out the <img> tag below
import Image from 'next/image'; // Recommended for Next.js projects for optimization

// Import the consistent DoctorAgent type from your schema file
import { type DoctorAgent } from "@/config/schema";

// Type for the component's props
// Use the imported DoctorAgent type for clarity and consistency
type Props = {
    doctorAgent: DoctorAgent;
    // setSelectedDoctor should be explicitly typed to accept a DoctorAgent
    setSelectedDoctor: (doctor: DoctorAgent) => void;
    SelectedDoctor?: DoctorAgent; // Can be undefined if no doctor is selected yet
};

// Renamed from `props` to `Props` as `props` is a common keyword in React
function SuggestedDoctorCard({ doctorAgent, setSelectedDoctor, SelectedDoctor }: Props) {
  return (
    // Add null/undefined checks for doctorAgent properties for safety, though with good data this is less critical
    <div
      className={`flex flex-col items-center border rounded-2xl shadow p-3 hover:border-blue-500 cursor-pointer ${
        SelectedDoctor?.id === doctorAgent?.id ? 'border-blue-500' : '' // Apply blue border if selected
      }`}
      onClick={() => setSelectedDoctor(doctorAgent)} // Pass the full doctorAgent object
    >
      {/* Use Next.js Image component for optimized images */}
      <Image
        src={doctorAgent?.image || '/placeholder-doctor.png'} // Provide a fallback image
        alt={doctorAgent?.specialist || 'Doctor'}
        width={70}
        height={70}
        className='w-[50px] h-[50px] rounded-full object-cover' // Use full for clarity, was rounded-4xl
      />
      {/* If not using Next.js Image, use the standard img tag: */}
      {/* <img className='w-[50px] h-[50px] rounded-full object-cover' src={doctorAgent?.image} alt={doctorAgent?.specialist} width={70} height={70} /> */}

      <h2 className='font-bold text-sm object-cover text-center mt-2'>{doctorAgent?.specialist}</h2>
      <p className='text-xs text-center line-clamp-2 text-gray-600'>{doctorAgent?.description}</p>
    </div>
  );
}

export default SuggestedDoctorCard;
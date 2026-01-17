import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@tabler/icons-react'
import React from 'react'
// If you are using Next.js, uncomment the following line and comment out the <img> tag below
// import Image from 'next/image'

type doctorAgent = {
    id:number,
    specialist:string,
    description:string,
    image:string,
    agentPrompt:string
}
type props = {
    doctorAgent:doctorAgent
}

function DoctorAgentCard({doctorAgent}:props) {
  return (
    <div >
      {/* Use the standard img tag if not using Next.js */}
      <img className='w-full h-[250px] object-cover rounded-xl' src={doctorAgent.image} alt={doctorAgent.specialist} width={200} height={300} />
      {/* If using Next.js, use the following instead: */}
      {/* <Image src={doctorAgent.image} alt={doctorAgent.specialist} width={200} height={300} /> */}
      <h2 className='font-bold '>{doctorAgent.specialist}</h2>
      <p className='line-clamp-2  text-sm text-gray-500'>{doctorAgent.description}</p>
      <Button className='w-full mt-2'>Start Consultation <IconArrowRight/> </Button>

    </div>
  )
}

export default DoctorAgentCard

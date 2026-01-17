// my-app/app/_components/CustomDialog.tsx
"use client"
import React, { useState, Fragment } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog" // Adjusted for my-app/app/_components/ui/dialog.tsx
import { Button } from '@/components/ui/button' // Adjusted for my-app/app/_components/ui/button.tsx
import { Textarea } from '@/components/ui/textarea' // Adjusted for my-app/app/_components/ui/textarea.tsx
import { DialogClose } from '@radix-ui/react-dialog'
import { ArrowRight, Loader2 } from 'lucide-react'


import axios from 'axios'
import SuggestedDoctorCard from './SuggestedDoctorCard' // Relative import from the same _components folder
import { useRouter } from 'next/navigation'

import { type DoctorAgent } from "@/config/schema"; // Adjusted for my-app/config/schema.ts

function CustomDialog () {
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [suggestedDoctors, setSuggestedDoctors] = useState<DoctorAgent[]>();
  const [SelectedDoctor, setSelectedDoctor] = useState<DoctorAgent | undefined>();

  const OnClickNext = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/users/suggest-doctors', {
        notes: note
      });
      console.log("Suggested Doctors API Response:", result.data);
      setSuggestedDoctors(result.data || []);
    } catch (error) {
      console.error("Failed to suggest doctors:", error);
      alert("Failed to get doctor suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const onStartConsultation = async () => {
    setLoading(true);
    if (!note || !SelectedDoctor) {
      console.error("Validation Error: Missing notes or selected doctor for consultation.");
      setLoading(false);
      alert("Please provide notes and select a doctor before starting the consultation.");
      return;
    }
    if (typeof SelectedDoctor.voiceId !== 'string' || SelectedDoctor.voiceId.trim() === '') {
        console.error("Validation Error: Selected doctor is missing a valid voiceId.");
        setLoading(false);
        alert("Selected doctor has an invalid voice configuration. Please select another doctor or check data.");
        return;
    }
    if (typeof SelectedDoctor.agentPrompt !== 'string' || SelectedDoctor.agentPrompt.trim() === '') {
        console.error("Validation Error: Selected doctor is missing a valid agentPrompt.");
        setLoading(false);
        alert("Selected doctor has an invalid agent prompt. Please select another doctor or check data.");
        return;
    }

    try {
      const result = await axios.post('/api/users/session-chat', {
        notes: note,
        SelectedDoctor: SelectedDoctor
      });
      console.log("Session Chat API Response:", result.data);
      if (result.data?.sessionID) {
        console.log("Navigating to session:", result.data.sessionID);
        router.push('/dashboard/medical-agent/' + result.data.sessionID);
      } else {
        console.error("Session ID not returned from API after successful POST.");
        alert("Failed to start consultation: Session ID missing from response.");
      }
    } catch (error: any) {
      console.error("Error starting consultation:", error);
      alert(`Failed to start consultation: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button className='mt-3'>+ Start a Consultation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Details</DialogTitle>
          <DialogDescription asChild>
            <div>
              {!suggestedDoctors ? (
                <div>
                  <h2>Add Symptoms or Any Other Details</h2>
                  <Textarea placeholder='Add Detail Here...' className='h-[200px] mt-1'
                    onChange={(e) => setNote(e.target.value)}
                    value={note}
                  />
                </div>
              ) : (
                <div>
                  <h2>Select the doctor</h2>
                  <div className='grid grid-cols-3 gap-5'>
                    {(suggestedDoctors || []).slice(0, 2).map((doctor, index) => (
                      <SuggestedDoctorCard
                        doctorAgent={doctor}
                        key={doctor.id || index}
                        setSelectedDoctor={() => setSelectedDoctor(doctor)}
                        SelectedDoctor={SelectedDoctor}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'outline'} disabled={loading}>Cancel</Button>
          </DialogClose>

          {!suggestedDoctors ? (
            <Button disabled={!note || loading} onClick={OnClickNext}>
              Next {loading && <Loader2 className='animate-spin ml-2' />} <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          ) : (
            <Button disabled={loading || !SelectedDoctor} onClick={onStartConsultation}>
              Start Consultation {loading && <Loader2 className='animate-spin ml-2' />} <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CustomDialog;
import React from 'react'
import HistoryList from './_components/HistoryList'
import { Button } from '@/components/ui/button'
import DoctorAgentList from '@/app/_components/DoctorAgentList'
import CustomDialog from '@/app/_components/Dialog'
import Link from "next/link";
function Dashboard() {
  return (
    <div>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-2xl'>My Dashboard</h2>
        <CustomDialog />
      </div>
      <HistoryList />
      <DoctorAgentList />
      <Link href="/dashboard/sorted-sessions">
        View Sorted Sessions
      </Link>
    </div>
  )
}

export default Dashboard



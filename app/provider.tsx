"use client"
import React, { ReactNode } from 'react'
import {useEffect,useState} from 'react'

export type UsersDetail = {
    name:string,
    email:string
}

import axios from 'axios'
import { useUser } from '@clerk/nextjs';
import { UserDetailContext } from '@/context/UserDetailContext'
function provider({ children }: { children: ReactNode }) {
    const {user} = useUser();
    const [userDetail,setUserDetail] = useState<any>();
    useEffect(() => {
     user&&CreateNewUser();
    }, [user])
    
    const CreateNewUser = async() => {
        const result = await axios.post('/api/users');
        console.log(result.data);
        setUserDetail(result.data);
    }
  return (
    <div>
        <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
      {children}
        </UserDetailContext.Provider>
    </div>
  )
}

export default provider

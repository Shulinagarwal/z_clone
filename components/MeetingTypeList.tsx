"use client"


import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { Router } from 'next/router'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from './ui/textarea'

import ReactDatePicker from 'react-datepicker'
import { Input } from './ui/input'

const MeetingTypeList = () => {

    const router=useRouter();

    const [meetingState,setMeetingstate]=useState<'isScheduleMeeting'|'isJoiningMeeting'|'isInstantMeeting'|undefined>()

    const {user}=useUser();
    const client=useStreamVideoClient();
    const [values,setValues]=useState({
      datetime:new Date(),
      description:'',
      link:'',

    });

    const [callDetails,setCallDetails]=useState<Call>();
    const { toast } = useToast();
    const createMeeting= async()=>{

      if(!client || !user) return;
      
      try {

        if(!values.datetime){
          toast({
            title: "Please select a time and date"
          })
          return;
        }
        const id=crypto.randomUUID();

        const call=client.call('default',id);

        if(!call) throw new Error('Failed to create a call')

        const startsAt=values.datetime.toISOString()|| 
        new Date(Date.now()).toISOString();

        const description=values.description||"Instant meeting"
 
        await call.getOrCreate({
          data:
          {
            starts_at:startsAt,
            custom:{
              description
            }
          }
        })
        setCallDetails(call)

        if(!values.description){
          router.push(`/meeting/${call.id}`)

          toast({
            title: "Meeting created"
          })
        }
      } catch (error) {
        console.log(error);
        toast({
          title: "failed to create a meeting"
        })
      }
    }

    const meetingLink=`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`
  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>

        <HomeCard

        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={()=>setMeetingstate('isInstantMeeting')}
        className="bg-orange-1"
        />
        <HomeCard
         img="/icons/schedule.svg"
         title="Schedule Meeting"
         description="Plan your meeting"
         handleClick={()=>setMeetingstate('isScheduleMeeting')}
          className="bg-blue-1"
         />
        <HomeCard
         img="/icons/recordings.svg"
         title="View Recordings"
         description="Check out your recordings"
         handleClick={()=>router.push('/recording')}
          className="bg-purple-1"
         />
        <HomeCard
         img="/icons/join-meeting.svg"
         title="Join Meeting"
         description="via invitation link"
         handleClick={()=>setMeetingstate('isJoiningMeeting')}
         className="bg-yellow-1"

        />

        {!callDetails?(
          <MeetingModal
          isOpen={meetingState==='isScheduleMeeting'}
          onClose={()=>setMeetingstate(undefined)}
          title="Create Meeting"
          buttonText="Schedule Meeting"
          handleClick={createMeeting}
      >
        <div className='flex flex-col gap-2.5'>
            <label className='text-base text-normal leading-[22px] text-sky-2'>
              Add a Description
            </label>
            <Textarea className='bg-dark-3 border-none focus-visible:ring-0 focus-visible:ring-offset-0'
            onChange={(e)=>{
              setValues({...values,description:e.target.value})
            }}
            />
        </div>

        <div className='flex w-full flex-col gap-2.5'>
        <label className='text-base text-normal leading-[22px] text-sky-2'>
              Select Date and Time
            </label>
            <ReactDatePicker
            selected={values.datetime}
            onChange={(date)=>setValues({...values,
              datetime:date!}
            )}
            showTimeSelect
            timeFormat='HH:mm'
            timeIntervals={15}
            timeCaption='time'
            dateFormat="MMMM d, yyyy h:mm aa"
            className='w-full rounded bg-dark-3 p-2 focus:outline-none'
            />
        </div>

      </MeetingModal>
        ):(
          <MeetingModal
            isOpen={meetingState==='isScheduleMeeting'}
            onClose={()=>setMeetingstate(undefined)}
            title="Meeting Created"
            buttonText="Copy Meeting Link"
            handleClick={()=>{
              navigator.clipboard.writeText(meetingLink);
              toast({title:'Link Copied'})
            }}

            image='/icons/checked.svg'
            buttonIcon='/icons/copy.svg'
            className='flex items-center justify-center'
        />
        )}
        <MeetingModal
            isOpen={meetingState==='isInstantMeeting'}
            onClose={()=>setMeetingstate(undefined)}
            title="Start an instant meeting"
            buttonText="Start Meeting"
            handleClick={createMeeting}
        />

        <MeetingModal
            isOpen={meetingState==='isJoiningMeeting'}
            onClose={()=>setMeetingstate(undefined)}
            title="Type the link here"
            buttonText="Start Meeting"
            handleClick={()=>router.push(values.link)}
        >
          <Input
            placeholder='Meeting Link'
            className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
            onChange={(e)=>setValues({...values,link:e.target.value})}
          />
        </MeetingModal>
       
    </section>
  )
}

export default MeetingTypeList
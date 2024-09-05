import StreamVideoProvider from '@/providers/StreamClientProvider'
import React, { Children, ReactNode } from 'react'

const layout = ({children }:{children:ReactNode}) => {
  return (
    <main>
      <StreamVideoProvider>
        {children}
        </StreamVideoProvider>
    </main>
  )
}

export default layout
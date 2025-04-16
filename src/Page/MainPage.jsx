import { useState } from 'react'

import HomePage from '../Layouts/HomePage'
import Navbar from '../Components/Navbar'
import Features from '../Layouts/Features'
import TalkFeature from '../Layouts/TalkFeature'
import Footer from '../Components/Footer'

const MainPage = () =>{


  return (
    <>
    <Navbar/>
    <HomePage/>
    <Features/>
    <TalkFeature/>
    <Footer/>
    
    </>
  )
}

export default MainPage

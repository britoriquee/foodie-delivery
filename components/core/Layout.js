import React from 'react'
import NavBar from './NavBar'
import Notify from './Notify'
import Modal from './Modal'
import Footer from './Footer'


function Layout({ children }) {
    return (
        <>
            <NavBar />
            <Notify />
            <Modal />
            {children}
            <Footer />
        </>
    )
}

export default Layout
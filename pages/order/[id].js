import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../../context/store'
import OrderDetail from '../../components/orders/OrderDetail'

const DetailOrder = () => {
    const {state, dispatch} = useContext(DataContext)
    const {orders, auth} = state

    const router = useRouter()

    const [orderDetail, setOrderDetail] = useState([])

    useEffect(() => {
        const newArr = orders.filter(order => order._id === router.query.id)
        setOrderDetail(newArr)
    },[orders])
            
    if(!auth.user) return null;
    return(
        <div className="my-3 container">
            <Head>
                <title>Detail Orders</title>
            </Head>

            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#">Home</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Orders</li>
                </ol>
            </nav>

            <div>
                <button className="btn btn-dark" onClick={() => router.back()}>
                    <i className="fas fa-long-arrow-alt-left"  aria-hidden="true"></i> Go Back
                </button>
            </div>
            
            <OrderDetail orderDetail={orderDetail} state={state} dispatch={dispatch} />
        
        </div>
    )
}

export default DetailOrder
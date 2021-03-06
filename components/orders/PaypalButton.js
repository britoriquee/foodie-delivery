import { useEffect, useRef, useContext } from 'react'
import {DataContext} from '../../context/store'
import {updateItem} from '../../context/actions'
import { ACTIONS } from '../../context/constants'
import { patchData } from '../../services/fetchData'

const PayPalButton = ({ order }) => {
    const refPaypalBtn = useRef()
    const {state, dispatch} = useContext(DataContext)
    const {auth, orders} = state

    useEffect(() => {
        paypal.Buttons({
            createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: order.total
                        }
                    }]
                })
            },
            onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                dispatch({
                    type: ACTIONS.NOTIFICATION,
                    payload: {loading: true}
                })

                return actions.order.capture().then(function(details) {
                    patchData(`order/payment/${order._id}`, {
                        paymentId: details.payer.payer_id
                    }, auth.token)
                    .then(res => {
                        if(res.err)
                            return dispatch({
                                type: ACTIONS.NOTIFICATION,
                                payload: {err: res.err}
                            })

                        dispatch(updateItem(orders, order._id, {
                            ...order,
                            paid: true,
                            dateOfPayment: details.create_time,
                            paymentId: details.payer.payer_id,
                            method: 'Paypal'
                        }, ACTIONS.ADD_ORDERS))

                        return dispatch({
                            type: ACTIONS.NOTIFICATION,
                            payload: {success: res.msg}
                        })
                    })
                    // This function shows a transaction success message to your buyer.
                })
            }
        }).render(refPaypalBtn.current)
    }, [])

    return (
        <div ref={refPaypalBtn}></div>
    )
}

export default PayPalButton
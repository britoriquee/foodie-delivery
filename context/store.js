import { createContext, useReducer, useEffect } from 'react'
import reducers from './reducers'
import { ACTIONS } from './constants'
import { getData } from '../services/fetchData'

export const DataContext = createContext()

export const DataProvider = ({ children }) => {
    const initialState = { 
        notify: {}, 
        auth: {}, 
        cart: [], 
        modal: [], 
        orders: [], 
        users: [], 
        categories: []
    }

    const [state, dispatch] = useReducer(reducers, initialState)
    const { cart, auth } = state

    useEffect(() => {
        const firstLogin = localStorage.getItem("firstLogin")
        if(firstLogin) {
            getData('auth/accessToken').then(res => {
                if(res.err)
                    return localStorage.removeItem("firstLogin")

                dispatch({
                    type: ACTIONS.AUTHENTICATED,
                    payload: {
                        token: res.access_token,
                        user: res.user
                    }
                })
            })

            getData('categories').then(res => {
                if(res.err) 
                    return dispatch({
                        type: ACTIONS.NOTIFICATION, 
                        payload: {error: res.err}
                    })
    
                dispatch({ 
                    type: ACTIONS.ADD_CATEGORIES,
                    payload: res.categories
                })
            })        
        }
    }, [])

    useEffect(() => {
        const __next__cart01 = JSON.parse(localStorage.getItem('__next__cart01'))

        if(__next__cart01) 
            dispatch({
                type: ACTIONS.ADD_CART,
                payload: __next__cart01
            })
    }, [])

    useEffect(() => {
        localStorage.setItem('__next__cart01', JSON.stringify(cart))
    }, [cart])

    useEffect(() => {
        if(auth.token) {
            getData('order', auth.token)
            .then(res => {
                if(res.err)
                    return dispatch({
                        type: ACTIONS.NOTIFICATION,
                        payload: {error: res.err}
                    })

                dispatch({
                    type: ACTIONS.ADD_ORDERS,
                    payload: res.orders,
                })
            })


            if(auth.user.role === 'admin') {
                getData('user', auth.token)
                .then(res => {
                    if(res.err)
                        return dispatch({
                            type: ACTIONS.NOTIFICATION,
                            payload: {error: res.err}
                        })

                    dispatch({
                        type: ACTIONS.ADD_USERS,
                        payload: res.users
                    })
                })
            }
        } else {
            dispatch({
                type: ACTIONS.ADD_ORDERS,
                payload: []
            })

            dispatch({
                type: ACTIONS.ADD_USERS,
                payload: []
            })
        }
    }, [auth.token])

    return (
        <DataContext.Provider value={{state, dispatch}}>
            {children}
        </DataContext.Provider>
    )
}

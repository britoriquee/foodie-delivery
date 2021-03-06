import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useContext, useEffect } from 'react'
import validator from '../services/validator'
import { ACTIONS } from '../context/constants'
import { DataContext } from '../context/store'
import { postData } from '../services/fetchData'

const Register = () => {
    const initialState = {
        name: '',
        email: '',
        password: '',
        confirm_password: ''
    }
    const [userData, setUserData] = useState(initialState)
    const { name, email, password, confirm_password } = userData

    const { state, dispatch } = useContext(DataContext)
    const { auth } = state

    const router = useRouter()

    const handleChangeInput = e => {
        const { name, value } = e.target
        setUserData({ ...userData, [name]: value })
        dispatch({ type: ACTIONS.NOTIFICATION, payload: {} })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        const errMsg = validator(name, email, password, confirm_password)
        if (errMsg)
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: errMsg } })

        dispatch({ type: ACTIONS.NOTIFICATION, payload: { loading: true } })

        const res = await postData('auth/register', userData)

        if (res.err)
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: res.err } })

        return dispatch({ type: ACTIONS.NOTIFICATION, payload: { success: res.msg } })
    }

    useEffect(() => {
        if (Object.keys(auth).length !== 0)
            router.push("/")
    }, [auth])

    return (
        <div>
            <Head>
                <title>Register Page</title>
            </Head>

            <form className="mx-auto my-4" style={{ maxWidth: '500px' }} onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input 
                        type="text" className="form-control" id="name"
                        name="name" value={name} onChange={handleChangeInput} 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input 
                        type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"
                        name="email" value={email} onChange={handleChangeInput} 
                    />
                    <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
                </div>

                <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input 
                        type="password" className="form-control" id="exampleInputPassword1"
                        name="password" value={password} onChange={handleChangeInput} 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="exampleInputPassword2">Confirm Password</label>
                    <input 
                        type="password" className="form-control" id="exampleInputPassword2"
                        name="confirm_password" value={confirm_password} onChange={handleChangeInput} 
                    />
                </div>

                <button type="submit" className="btn btn-dark w-100">Register</button>

                <p className="my-2">
                    Already have an account? <Link href="/signin"><a style={{ color: 'crimson' }}>Login Now</a></Link>
                </p>
            </form>

        </div>
    )
}

export default Register
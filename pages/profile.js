import Head from 'next/head'
import Link from 'next/link'
import { useState, useContext, useEffect } from 'react'
import { DataContext } from '../context/store'
import { ACTIONS } from '../context/constants'
import validator from '../services/validator'
import { patchData } from '../services/fetchData'
import { uploadImage } from '../services/uploadImage'

const Profile = () => {
    const initialState = {
        avatar: '',
        name: '',
        password: '',
        confirm_password: '',
    }
    const [data, setData] = useState(initialState)
    const { avatar, name, password, confirm_password } = data

    const { state, dispatch } = useContext(DataContext)
    const { auth, notify, orders } = state

    useEffect(() => {
        if (auth.user) setData({ ...data, name: auth.user.name })
    }, [auth.user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setData({ ...data, [name]: value })
        dispatch({ type: ACTIONS.NOTIFICATION, payload: {} })
    }

    const handleUpdateProfile = e => {
        e.preventDefault()
        if (password) {
            const errMsg = validator(name, auth.user.email, password, confirm_password)
            if (errMsg)
                return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: errMsg } })

            updatePassword()
        }

        if (name !== auth.user.name || avatar) updateInfo()
    }

    const updatePassword = () => {
        dispatch({ type: ACTIONS.NOTIFICATION, payload: { loading: true } })
        patchData('user/resetPassword', { password }, auth.token)
            .then(res => {
                if (res.err)
                    return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: res.err } })
                return dispatch({ type: ACTIONS.NOTIFICATION, payload: { success: res.msg } })
            })
    }

    const changeAvatar = (e) => {
        const file = e.target.files[0]
        if (!file)
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: 'File does not exist.' } })

        if (file.size > 1024 * 1024) //1mb
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: 'The largest image size is 1mb.' } })

        if (file.type !== "image/jpeg" && file.type !== "image/png") //1mb
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: 'Image format is incorrect.' } })

        setData({ ...data, avatar: file })
    }

    const updateInfo = async () => {
        let media
        dispatch({ type: ACTIONS.NOTIFICATION, payload: { loading: true } })

        if (avatar)
            media = await uploadImage([avatar])

        patchData('user', {
            name, avatar: avatar ? media[0].url : auth.user.avatar
        }, auth.token).then(res => {
            if (res.err)
                return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: res.err } })

            dispatch({
                type: ACTIONS.NOTIFICATION, payload: {
                    token: auth.token,
                    user: res.user
                }
            })
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { success: res.msg } })
        })
    }

    if (!auth.user)
        return null

    return (
        <div className="profile_page container">
            <Head>
                <title>Profile</title>
            </Head>

            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#">Home</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Profile</li>
                </ol>
            </nav>

            <section className="row text-secondary my-3">
                <div className="col-md-4">
                    <h3 className="text-center text-uppercase">
                        {auth.user.role === 'user' ? 'User Profile' : 'Admin Profile'}
                    </h3>

                    <div className="avatar">
                        <img src={avatar ? URL.createObjectURL(avatar) : auth.user.avatar} alt="avatar" />
                        <span>
                            <i className="fas fa-camera"></i>
                            <p>Change</p>
                            <input
                                type="file" name="file" id="file_up"
                                accept="image/*" onChange={changeAvatar}
                            />
                        </span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text" name="name"
                            value={name} className="form-control"
                            placeholder="Your name" onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="text" name="email"
                            defaultValue={auth.user.email}
                            className="form-control" disabled={true}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password" name="password"
                            value={password} className="form-control"
                            placeholder="Your new password" onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm_password">Confirm New Password</label>
                        <input
                            type="password" name="confirm_password"
                            value={confirm_password} className="form-control"
                            placeholder="Confirm new password" onChange={handleChange}
                        />
                    </div>

                    <button
                        className="btn btn-info"
                        disabled={notify.loading}
                        onClick={handleUpdateProfile}
                    >Update</button>
                </div>

                <div className="col-md-8">
                    <h3 className="text-uppercase">Orders</h3>

                    <div className="my-3 table-responsive">
                        <table className="table-bordered table-hover w-100 text-uppercase"
                            style={{ minWidth: '600px', cursor: 'pointer' }}>
                            <thead className="bg-light font-weight-bold">
                                <tr>
                                    <td className="p-2">id</td>
                                    <td className="p-2">date</td>
                                    <td className="p-2">total</td>
                                    <td className="p-2">delivered</td>
                                    <td className="p-2">paid</td>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    orders.map(order => (
                                        <tr key={order._id}>
                                            <td className="p-2">
                                                <Link href={`/order/${order._id}`}>
                                                    <a>{order._id}</a>
                                                </Link>

                                            </td>
                                            <td className="p-2">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-2">${order.total}</td>
                                            <td className="p-2">
                                                {
                                                    order.delivered
                                                        ? <i className="fas fa-check text-success"></i>
                                                        : <i className="fas fa-times text-danger"></i>
                                                }
                                            </td>
                                            <td className="p-2">
                                                {
                                                    order.paid
                                                        ? <i className="fas fa-check text-success"></i>
                                                        : <i className="fas fa-times text-danger"></i>
                                                }
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>

                        </table>
                    </div>
                </div>

            </section>
        </div>
    )
}

export default Profile
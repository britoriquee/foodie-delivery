import Head from 'next/head'
import { useContext, useState } from 'react'
import { ACTIONS } from '../context/constants'
import { DataContext } from '../context/store'
import { updateItem } from '../context/actions'
import { postData, putData } from "../services/fetchData"

const Categories = () => {
    const [name, setName] = useState('')

    const { state, dispatch } = useContext(DataContext)
    const { categories, auth } = state

    const [id, setId] = useState('')

    const createCategory = async () => {
        if (auth.user.role !== 'admin')
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: 'Authentication is not valid.' } })
        if (!name)
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: 'Name can not be left blank.' } })

        dispatch({ type: ACTIONS.NOTIFICATION, payload: { loading: true } })

        let res
        if (id) {
            res = await putData(`categories/${id}`, { name }, auth.token)
            if (res.err)
                return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: res.err } })

            dispatch(updateItem(categories, id, res.category, ACTIONS.ADD_CATEGORIES))
        } else {
            res = await postData('categories', { name }, auth.token)
            if (res.err)
                return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: res.err } })

            dispatch({ type: ACTIONS.ADD_CATEGORIES, payload: [...categories, res.newCategory] })
        }

        setName('')
        setId('')
        return dispatch({ type: ACTIONS.NOTIFICATION, payload: { success: res.msg } })
    }

    const handleEditCategory = (category) => {
        setId(category._id)
        setName(category.name)
    }

    return (
        <div className="col-md-6 mx-auto my-3">
            <Head>
                <title>Categories</title>
            </Head>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#">Home</a></li>
                    <li class="breadcrumb-item"><a href="#">Admin</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Categories</li>
                </ol>
            </nav>

            <div className="input-group mb-3">
                <input
                    type="text" className="form-control"
                    placeholder="Add a new category" value={name}
                    onChange={e => setName(e.target.value)}
                />

                <button
                    className="btn btn-secondary ml-1"
                    onClick={createCategory}
                >
                    {id ? "Update" : "Create"}
                </button>
            </div>

            {
                categories.map(category => (
                    <div key={category._id} className="card my-2 text-capitalize">
                        <div className="card-body d-flex justify-content-between">
                            {category.name}
                            <div style={{ cursor: 'pointer' }}>
                                <i className="fas fa-edit mr-2 text-info"
                                onClick={() => handleEditCategory(category)}></i>

                                <i className="fas fa-trash-alt text-danger"
                                data-toggle="modal" data-target="#exampleModal"
                                onClick={() => dispatch({
                                    type: ACTIONS.ADD_MODAL,
                                    payload: [{
                                        data: categories, id: category._id,
                                        title: category.name, type: ACTIONS.ADD_CATEGORIES
                                    }]
                                })} ></i>
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default Categories
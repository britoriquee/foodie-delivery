import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useContext, useEffect } from 'react'
import { ACTIONS } from '../../context/constants'
import { DataContext } from '../../context/store'
import { uploadImage } from '../../services/uploadImage'
import { postData, getData, putData } from '../../services/fetchData'

const ProductsManager = () => {
    const initialState = {
        title: '',
        price: 0,
        inStock: 0,
        description: '',
        restaurant: '',
        category: ''
    }

    const [product, setProduct] = useState(initialState)
    const { title, price, inStock, description, restaurant, category } = product

    const [images, setImages] = useState([])

    const { state, dispatch } = useContext(DataContext)
    const { categories, auth } = state

    const router = useRouter()
    const { id } = router.query
    const [onEdit, setOnEdit] = useState(false)

    useEffect(() => {
        if(id) {
            setOnEdit(true)
            getData(`product/${id}`).then(res => {
                setProduct(res.product)
                setImages(res.product.images)
            })
        } else {
            setOnEdit(false)
            setProduct(initialState)
            setImages([])
        }
    }, [id])

    const handleChangeInput = e => {
        const { name, value } = e.target
        setProduct({ ...product, [name]: value })
        dispatch({ type: ACTIONS.NOTIFICATION, payload: {} })
    }

    const handleUploadInput = e => {
        dispatch({ type: ACTIONS.NOTIFICATION, payload: {} })
        let newImages = []
        let num = 0
        let err = ''
        const files = [...e.target.files]

        if(files.length === 0)
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: 'Files does not exist.' } })

        files.forEach(file => {
            if(file.size > 1024 * 1024) 
                return err = 'The largest image size is 1mb'

            if (file.type !== 'image/jpeg' && file.type !== 'image/png')
                return err = 'Image format is incorrect.'

            num += 1;
            if (num <= 5) newImages.push(file)
            return newImages;
        })

        if(err)
            dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: err } })

        const imgCount = images.length
        if (imgCount + newImages.length > 5)
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: 'Select up to 5 images.' } })
        setImages([...images, ...newImages])
    }

    
    const deleteImage = index => {
        const newArr = [...images]
        newArr.splice(index, 1)
        setImages(newArr)
    }

    const handleSubmit = async(e) => {
        e.preventDefault()

        if(auth.user.role !== 'admin')
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: 'Authentication is not valid.' } })

        if (!title || !price || !inStock || !description || !restaurant || category === 'all' || images.length === 0)
            return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: 'Please add all the fields.' } })

        dispatch({ type: ACTIONS.NOTIFICATION, payload: { loading: true }})
        let media = []
        const imgNewURL = images.filter(img => !img.url)
        const imgOldURL = images.filter(img => img.url)

        if(imgNewURL.length > 0)
            media = await uploadImage(imgNewURL)

        let res
        if(onEdit) {
            res = await putData(`product/${id}`, {...product, images: [...imgOldURL, ...media]}, auth.token)
            if(res.err)
                return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: res.err }})
        } else {
            res = await postData(`product`, {...product, images: [...imgOldURL, ...media]}, auth.token)
            if(res.err)
                return dispatch({ type: ACTIONS.NOTIFICATION, payload: { error: res.err }})
        }

        return dispatch({ type: ACTIONS.NOTIFICATION, payload: { success: res.msg }})
    }
    
    return (
        <div className="products_manager container">
            <Head>
                <title>Products Manager</title>
            </Head>

            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#">Home</a></li>
                    <li class="breadcrumb-item"><a href="#">Admin</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Create Product</li>
                </ol>
            </nav>

            <form className="row" onSubmit={handleSubmit}>
                <div className="col-md-6">
                    <input 
                        type="text" name="title" value={title}
                        placeholder="Title" className="d-block my-4 w-100 p-2"
                        onChange={handleChangeInput} 
                    />

                    <div className="row">
                        <div className="col-sm-6">
                            <label htmlFor="price">Price</label>
                            <input 
                                type="number" name="price" value={price}
                                placeholder="Price" className="d-block w-100 p-2"
                                onChange={handleChangeInput} 
                            />
                        </div>

                        <div className="col-sm-6">
                            <label htmlFor="price">In Stock</label>
                            <input 
                                type="number" name="inStock" value={inStock}
                                placeholder="inStock" className="d-block w-100 p-2"
                                onChange={handleChangeInput} 
                            />
                        </div>
                    </div>

                    <textarea 
                        name="description" id="description" cols="30" rows="4"
                        placeholder="Description" onChange={handleChangeInput}
                        className="d-block my-4 w-100 p-2" value={description} 
                    />

                    <textarea 
                        name="restaurant" id="restaurant" cols="30" rows="6"
                        placeholder="restaurant" onChange={handleChangeInput}
                        className="d-block my-4 w-100 p-2" value={restaurant} 
                    />

                    <div className="input-group-prepend px-0 my-2">
                        <select 
                            name="category" id="category" value={category}
                            onChange={handleChangeInput} className="custom-select text-capitalize"
                        >
                            <option value="all">All Products</option>
                            {
                                categories.map(item => (
                                    <option key={item._id} value={item._id}>
                                        {item.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <button type="submit" className="btn btn-info my-2 px-4">
                        {onEdit ? 'Update' : 'Create'}
                    </button>
                </div>

                <div className="col-md-6 my-4">
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Upload</span>
                        </div>

                        <div className="custom-file border rounded">
                            <input 
                                type="file" className="custom-file-input"
                                onChange={handleUploadInput} multiple accept="image/*" 
                            />
                        </div>
                    </div>

                    <div className="row img-up mx-0">
                        {
                            images.map((img, index) => (
                                <div key={index} className="file_img my-1">
                                    <img src={img.url ? img.url : URL.createObjectURL(img)}
                                        alt="" className="img-thumbnail rounded" />

                                    <span onClick={() => deleteImage(index)}>X</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </form>
        </div>
    )
}

export default ProductsManager
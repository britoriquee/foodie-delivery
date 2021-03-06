import { useContext } from 'react'
import Toast from '../shared/Toast'
import Loading from '../shared/Loading'
import { DataContext } from '../../context/store'
import { ACTIONS } from '../../context/constants'

const Notify = () => {
    const {state, dispatch} = useContext(DataContext)
    const { notify } = state

    return (
        <>
            {notify.loading && <Loading />}
            {notify.error && 
                <Toast 
                    msg={{ msg: notify.error, title: 'Error' }}
                    handleShow={() => dispatch({ type: ACTIONS.NOTIFICATION, payload: {} })}
                    bgColor="bg-danger"
                />
            }

            {notify.success && 
                <Toast 
                    msg={{ msg: notify.success, title: 'Success' }}
                    handleShow={() => dispatch({ type: ACTIONS.NOTIFICATION, payload: {} })}
                    bgColor="bg-success"
                />
            }
        </>
    )
}


export default Notify
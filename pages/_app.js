import '../styles/globals.css'
import Layout from '../components/core/Layout'
import { DataProvider } from '../context/store'

function MyApp({ Component, pageProps }) {
  return (
    <DataProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </DataProvider>
  )
}

export default MyApp

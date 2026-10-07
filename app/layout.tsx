import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL('https://vivir-segura.vercel.app'),title:{default:'Vivir Segura — Patrimonio que se vive.',template:'%s | Vivir Segura'},description:'Descubre casas, apartamentos, fincas y tierras en Cartagena y Bolívar. Propiedades reales, información clara y atención personal.',openGraph:{title:'Vivir Segura — Encuentra tu lugar',description:'Tierras, fincas y propiedades en Cartagena y Bolívar.',images:['/media/finca-21.webp']},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}

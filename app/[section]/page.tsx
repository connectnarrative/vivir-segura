import Site from '../site';import {catalog} from '../../lib/backend';import {notFound} from 'next/navigation';
const views:Record<string,string>={propiedades:'search',guardados:'saved',comparar:'compare',vender:'seller','encuentra-tu-lugar':'quiz',contacto:'contact',nosotros:'about',explorar:'areas',admin:'admin',privacidad:'privacy'};
export async function generateMetadata({params}:{params:Promise<{section:string}>}){const {section}=await params;return {title:section==='propiedades'?'Propiedades en Cartagena y Bolívar':section.charAt(0).toUpperCase()+section.slice(1)}}
export default async function Page({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!views[section])notFound();return <Site initial={await catalog()} view={views[section]}/>}

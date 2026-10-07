export const dynamic='force-dynamic';
import Site from './site';import {catalog} from '../lib/backend';
export default async function Home(){return <Site initial={await catalog()} view="home"/>}

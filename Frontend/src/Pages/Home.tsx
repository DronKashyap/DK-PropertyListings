import { useRecoilValue } from 'recoil';
import { useridAtom } from '../Recoil/State';
import ListingComponent from '../Components/ListingComponent';


function Home() {

  const currentUser = useRecoilValue(useridAtom); 
  console.log('Current User:', currentUser);
  return (
    <div className="bg-slate-200 h-full">
      {/* banner */}
      <div className="h-[400px] flex flex-col justify center">
        <h1 className="text-6xl font-extrabold text-wrap w-2/3 text-slate-500 ml-12 pt-20">Find your next <span className="text-purple-400">Perfect</span> place with Ease</h1>
        <h2 className="ml-12 mt-6 text-2xl font-semibold w-4/6 text-slate-400 text-wrap">DK Property Listings will help you find your home fast, easy and comfortable.Our expert support are always available.</h2>
        <a className="ml-12 pt-12 font-semibold text-blue-600 ">Let's Start Now....</a>
      </div>
      {/* image */}
      <div className="pt-5 flex justify-center">
      <img src="/bannerimg.jpg" className="rounded-2xl h-[600px] w-full"  />
      </div>
      {/* properties */}
      <ListingComponent />
    </div>
  )
}

export default Home

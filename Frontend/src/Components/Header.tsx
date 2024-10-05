import { useRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import { LoginState } from '../Recoil/State';  
import Dropdown from './ui/Dropdown';

function Header() {
  const [loggedin] = useRecoilState(LoginState);
  console.log("appbar re-render")
  return (
    <div className='flex justify-between bg-slate-300 shadow-lg p-2'>
      <h1 className='font-semibold text-red-400'> <span className='font-bold text-slate-500'>DK </span> Property Listings</h1>
      <div className='flex'>
        <Link to='/'>
          <h3 className='pr-3 cursor-pointer mr-4'> Home </h3>
        </Link>
        <Link to='/about'>
          <h3 className='pr-10 cursor-pointer'> About </h3>
        </Link>
        
        <div className="cursor-pointer">
          {loggedin ? (
            <Dropdown />
          ) : (
            <div>
              <Link to='/signin'> <button className='pr-  bg-blue-300 hover:scale-110 rounded-xl px-3 font-bold'>SignIn</button></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;

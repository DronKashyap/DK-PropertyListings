import React from 'react';
import { useRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import { LoginState } from '../Recoil/State';  // Correctly import the atom

function Header() {
  const [loggedin] = useRecoilState(LoginState);  // Destructure the state value

  return (
    <div className='flex justify-between bg-slate-300 shadow-lg p-4'>
      <h1> DK Property Listings</h1>
      <form>
        <input type="text" placeholder='Search....' className='border-2 rounded-md border-sky-700 px-2' />
      </form>
      <div className='flex'>
        <Link to='/'>
          <h3 className='pr-3 cursor-pointer'> Home </h3>
        </Link>
        <Link to='/about'>
          <h3 className='pr-10 cursor-pointer'> About </h3>
        </Link>
        <div className="cursor-pointer">
          {loggedin ? (
            <h3> Hi! User </h3>
          ) : (
            <div>
              <Link to='/signup'> <button className='mr-3 p-1 rounded-md bg-blue-300'>Signup</button></Link>
              <Link to='/signin'> <button className='pr-3'>SignIn</button></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;

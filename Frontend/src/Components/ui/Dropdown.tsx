import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil'; 
import { LoginState, useridAtom } from '../../Recoil/State'; 

function Dropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [, setLoginState] = useRecoilState(LoginState);
    const [, setUserId] = useRecoilState(useridAtom); 

    const handleSignOut = () => {
        localStorage.removeItem('authToken');
        setUserId(null); 
        setLoginState(false); 
        console.log("User signed out"); 
    };

    const handleMouseEnter = () => {
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        setIsOpen(false);
    };

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative"> 
            <button className="bg-blue-500 text-white px-4 py-2 rounded">Menu</button>
            {isOpen && ( 
                <div className="flex flex-col items-center absolute w-[150px] right-0 rounded-md top-10 bg-white shadow-lg">
                    <Link to='/profile' className='mb-2 hover:text-blue-500'>Profile</Link>
                    <Link to='/create-listing' className='mb-2 hover:text-blue-500'>Create Listing</Link>
                    <Link to='/update-listing' className='mb-2 hover:text-blue-500'>My Listings</Link>
                    <button onClick={handleSignOut} className="hover:text-red-500">Sign Out</button>
                </div>
            )}
        </div>
    );
}

export default Dropdown;

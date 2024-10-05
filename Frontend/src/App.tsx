import Home from './Pages/Home';
import About from './Pages/About';
import CreateListing from './Pages/CreateListing';
import Signin from './Pages/Signin';
import Signup from './Pages/Signup';
import UpdateListing from './Pages/UpdateListing';
import Header from './Components/Header';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

function App() {
  return (
    <RecoilRoot>
    <BrowserRouter>
    <Header /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/update-listing" element={<UpdateListing />} />
      </Routes>
    </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
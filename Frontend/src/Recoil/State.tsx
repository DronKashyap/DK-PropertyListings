import { atom } from "recoil";


export const LoginState= atom ({
    key: 'loginstate',
    default: false,
})


interface User {
    _id: number; 
  }
  
export const useridAtom = atom<User | null>({
    key: 'usernameAtom', 
    default: null,         
  });


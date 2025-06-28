
import Cookies from 'js-cookie';

export const setUserCookie = (key, value) => {
  Cookies.set(key, value, {
    expires: 2, 
    path: '/',
  });
};

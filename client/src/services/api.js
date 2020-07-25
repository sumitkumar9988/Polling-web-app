import axios from 'axios';

const host = 'http://localhost:3001/api';



export const setToken = token => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};


const call = async (meathod, path, data) => {
    const response = await axios[meathod](`${host}/${path}`, data);
    return response.data;
};
export default call;
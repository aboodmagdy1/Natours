//to update email ,name ,password

import axios from "axios"
import { showAlert } from "./alert"


//data is a object of all data that will be update
//type is either 'password' or 'data'
export const updateSettings = async (data, type)=>{
     
try{
    const url = type === 'password' ?'http://127.0.0.1:3000/api/v1/users/updateMyPassword':'http://127.0.0.1:3000/api/v1/users/updateMe'
    const result = await  axios({
        method:'PATCH',
        url,
        data
    })
    if (result.data.status === 'success') {
        showAlert('success',`${type.toUpperCase()} updated successfully`)
    }
    
}catch(err){
    console.log(err.response.data)
    showAlert('error',err.response.data.message)
}
}

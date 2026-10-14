import api from './api/axiosConfig';
import { useState } from 'react';

function Delete() {
    const [data] = useState(
        {
        uname:localStorage.getItem("uname"),
        psw:localStorage.getItem("upsw")
        }
    )
    const submit= async()=>
    {
        try {
            const res = await api.post("/delete", data);
            alert(res.data);
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Failed to delete account");
        }
    }
    return(
        <>
            <h3>Heyy iam Update</h3>
            <button onClick={submit}>Delete account</button>
        </>
    )
}

export default Delete
import axios from 'axios';
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
        const res = await axios.post("http://localhost:8080/delete",data)
        alert(res.data)
    }
    return(
        <>
            <h3>Heyy iam Update</h3>
            <button onClick={submit}>Delete account</button>
        </>
    )
}

export default Delete
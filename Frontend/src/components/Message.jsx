export default function Message({text,error}){return text?<div className={`message ${error?'error':'success'}`}>{text}</div>:null}

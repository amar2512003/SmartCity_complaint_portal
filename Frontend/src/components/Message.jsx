export default function Message({text,error}){return text?<div role={error?'alert':'status'} className={`message ${error?'error':'success'}`}>{text}</div>:null}

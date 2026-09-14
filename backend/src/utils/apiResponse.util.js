export const ok=(res,data,message='Success')=>res.json({success:true,message,data});
export const fail=(res,message='Something went wrong',status=400,data=undefined)=>res.status(status).json({success:false,message,...(data!==undefined?{data}:{})});

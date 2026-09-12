import { t } from '../i18n/index.js';
export const errorHandler=(err,req,res,next)=>{console.error(err);res.status(500).json({success:false,message:t('common:internal_server_error',req.lang)});};

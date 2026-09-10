import { db } from '../config/db.js';
export const findAdminByEmail=(email)=>db('users').where({email,role:'admin'}).first();

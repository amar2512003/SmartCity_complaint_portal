import { db } from '../config/db.js';
export const findUserByEmail=(email)=>db('users').where({email}).first();
export const findUserById=(id)=>db('users').where({id}).first();
export const createUser=async({name,email,passwordHash})=>{const [u]=await db('users').insert({name,email,password_hash:passwordHash,role:'citizen'}).returning(['id','name','email','role']);return u;};

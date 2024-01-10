const User=require('../models/User')
const Note=require('../models/Note')
const asyncHandler=require('express-async-handler')
const bcrypt=require('bcrypt')

//@desc Get all user
//@route GET /user
//@acess Private
const getAllUsers=asyncHandler(async(req,res)=>{
    const users=await User.find().select('-password').lean()
    if(!users?.length){
        return res.status(400).json({message:'No users found'})
    }
    res.json(users)
})

//@desc create new user
//@route POST /user
//@acess Private
const createNewUser=asyncHandler(async(req,res)=>{
    const {username,password,roles}=req.body

    //confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({message:'All fiekds are required'})
    }
    //check for Duplicate
    const duplicate =await User.findOne({username}).lean().exec()
    if (duplicate){
        return res.status(409).json({message: 'Duplicate Username'})
    }

    //Hash password
    const hashedpwd= await bcrypt.hash(password,10)//salt rounds
    const userObject={username,"password":hashedpwd,roles}

    //create and store new user
    const user=await User.create(userObject)
    if(user){
        res.status(201).json({message:`New user ${username} created`})
    }else{
        res.status(400).json({message:`Invalid user data received`})
    }
})

//@desc update  a user
//@route PATCH /user
//@acess Private
const updateUsers=asyncHandler(async(req,res)=>{
    const {id,username,roles,active,password}=req.body

    //confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !=='boolean'){
        return res.status(400).json({message:`Invalid user data required`})
    }
    const user =await User.findById(id).exec()
    if(!user){
        return res.status(400).json({message:`User not found`})
    }

    //check for duplicate
    const duplicate =await User.findOne({username}).lean().exec()
    if (duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate Username'})
    }

    user.username=username
    user.roles=roles
    user.active=active

    if(password){
        //hash password
        user.password=await bcrypt.hash(password,10)//salt rounds
    }
    const updatedUser=await user.save()

    res.json({message:`${updatedUser.username} updated`})
})

//@desc delete  a user
//@route DELETE /user
//@acess Private
const deleteUsers=asyncHandler(async(req,res)=>{
    const {id}=req.body
    if(!id){
        return res.status(400).json({message:'User ID Required'})
    }

    const note=await Note.findOne({user:id}).lean().exec()
    if(note){
        return res.status(400).json({message:'User has assigned Notes'})
    }
    const user=await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message:'User not found'})
    }

    const result=await user.deleteOne()
    const reply=`Username ${result.username} with ID ${result._id} deleted`
    res.json(reply)
})

module.exports={
    getAllUsers,
    createNewUser,
    updateUsers,
    deleteUsers
}